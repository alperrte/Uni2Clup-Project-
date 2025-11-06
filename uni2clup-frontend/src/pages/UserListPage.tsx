// pages/UserListPage.tsx
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8080";

interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    registrationDate: string; // Backend'den bu isimle geldiğini varsayıyorum
}

interface UserListPageProps {
    targetRole: "Student" | "Academic" | "ClubManager" | "Admin";
}

const translateRole = (role: string) => {
    switch (role) {
        case "Admin":
            return "Yönetici";
        case "Student":
            return "Öğrenci";
        case "Academic":
            return "Akademisyen";
        case "ClubManager":
            return "Kulüp Yöneticisi";
        default:
            return role;
    }
};

const UserListPage: React.FC<UserListPageProps> = ({ targetRole }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [fetching, setFetching] = useState(true);
    const token = localStorage.getItem("token")?.trim() || "";

    const pageTitle = `${translateRole(targetRole)} Listesi`;

    // 👥 Kullanıcıları Listele (Filtreli)
    const fetchUsers = async () => {
        setFetching(true);
        try {
            // Backend'in tüm kullanıcıları çekip frontend'de filtreleme yaptığını varsayıyoruz. 
            // Daha iyi performans için backend'de filtreleme API'si olmalıydı.
            const res = await fetch(`${API_URL}/api/Auth/users`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                alert("🔒 Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            const data: User[] = await res.json();
            const filteredUsers = data.filter(u => u.role === targetRole);
            setUsers(filteredUsers);
        } catch (error) {
            console.error(`🚫 ${targetRole} listesi alınamadı:`, error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [targetRole, token]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;

        try {
            const res = await fetch(`${API_URL}/api/Auth/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setUsers(users.filter((u) => u.id !== id));
                alert("✅ Kullanıcı başarıyla silindi.");
            } else if (res.status === 401) {
                alert("🚫 Token geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
            } else {
                alert("❌ Kullanıcı silinemedi.");
            }
        } catch {
            alert("🚫 Sunucu bağlantı hatası!");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Bilinmiyor";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="p-6 bg-gray-800 shadow rounded-lg">
            <h1 className="text-3xl font-bold mb-6 text-indigo-400">{pageTitle}</h1>

            {fetching ? (
                <p className="text-indigo-300">🔄 Kullanıcılar yükleniyor...</p>
            ) : users.length === 0 ? (
                <p className="text-gray-400">Bu rolde kayıtlı kullanıcı yok.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate" style={{ borderSpacing: '0 8px' }}>
                        <thead className="text-sm uppercase bg-gray-700 text-gray-400">
                            <tr>
                                <th className="py-3 px-6 text-left rounded-l-lg">Ad Soyad</th>
                                <th className="py-3 px-6 text-left">E-posta</th>
                                <th className="py-3 px-6 text-left">Rol</th>
                                <th className="py-3 px-6 text-left">Kayıt Tarihi</th>
                                <th className="py-3 px-6 text-center rounded-r-lg">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="bg-gray-700 hover:bg-gray-600 transition-colors duration-150">
                                    <td className="py-3 px-6 rounded-l-lg font-medium text-white">
                                        {user.name} {user.surname}
                                    </td>
                                    <td className="py-3 px-6 text-gray-300">{user.email}</td>
                                    <td className="py-3 px-6 text-gray-300">{translateRole(user.role)}</td>
                                    <td className="py-3 px-6 text-gray-300 text-sm">{formatDate(user.registrationDate)}</td>
                                    <td className="py-3 px-6 text-center rounded-r-lg">
                                        {/* Dropdown yerine direkt Sil butonu (basitlik için) */}
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-400 hover:text-red-500 font-semibold text-sm transition-colors duration-150 p-2 rounded hover:bg-red-900/20"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserListPage;