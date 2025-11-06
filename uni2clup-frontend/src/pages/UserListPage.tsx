import React, { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:8080";

interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    registrationDate: string;
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token")?.trim() || "";
    const pageTitle = `${translateRole(targetRole)} Listesi`;

    // ✅ Token kontrolü
    const checkTokenValidity = useCallback(() => {
        if (!token) {
            alert("🔒 Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            window.location.reload();
            return false;
        }
        return true;
    }, [token]);

    // 👥 Kullanıcıları Listele (Filtreli)
    const fetchUsers = async () => {
        if (!checkTokenValidity()) return;
        setFetching(true);
        try {
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
            alert("🚫 Sunucuya bağlanılamadı. Backend (8080) açık mı?");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [targetRole, token]);

    const handleDelete = async (id: number) => {
        if (!checkTokenValidity()) return;
        if (!window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;

        try {
            const res = await fetch(`${API_URL}/api/Auth/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                alert("🚫 Token geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            if (res.ok) {
                setUsers(users.filter((u) => u.id !== id));
                setSuccessMessage("✅ Kullanıcı başarıyla silindi.");
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 2000);
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
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }) + ' ' + date.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex flex-col items-center py-10 px-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-15 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#1e3a8a] to-[#2d1b69] rounded-full opacity-10 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-8 animate-pulse delay-500"></div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#3b82f6] rounded-full animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-bounce">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-28 h-28 border-2 border-[#3b82f6] rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                    </div>

                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent animate-pulse">
                        {pageTitle}
                    </h1>
                </div>

                {/* User List */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                    <div className="bg-[#0f0f1a] rounded-lg p-6">
                        {fetching ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-300 text-lg">Kullanıcılar yükleniyor...</span>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <p className="text-gray-400 text-lg">Bu rolde kayıtlı kullanıcı yok.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-b-2 border-[#3b82f6]">
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Ad Soyad</th>
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">E-posta</th>
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Rol</th>
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Kayıt Tarihi</th>
                                            <th className="py-4 px-6 text-center text-lg font-bold text-[#3b82f6]">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] hover:from-[#2a2a3e] hover:to-[#3a3a4e] transition-all duration-300 group"
                                            >
                                                <td className="py-4 px-6 font-medium text-white text-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-sm">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span>{user.name} {user.surname}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-300">{user.email}</td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] text-white">
                                                        {translateRole(user.role)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-gray-300 text-sm">{formatDate(user.registrationDate)}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="bg-indigo-700 hover:bg-indigo-900 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                                                    >
                                                        🗑️ Sil
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-2xl p-8 mx-4 max-w-md w-full transform animate-bounceIn shadow-2xl">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">İşlem Başarılı!</h3>
                            <p className="text-gray-300 mb-6">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserListPage;
