import React, { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:8080";

interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    registrationDate: string;
    isActive: boolean;
    clubId?: number;
    departmentName?: string;
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
    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("Hepsi");
    const [filterClub, setFilterClub] = useState("Hepsi");
    const [fetching, setFetching] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showClubModal, setShowClubModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [clubs, setClubs] = useState<Array<{ id: number; name: string; departmentName: string }>>([]);
    const [departments, setDepartments] = useState<Array<{ id: number; name: string; code: string }>>([]);
    const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
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

    // Kulüpleri yükle
    const fetchClubs = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/Club`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                // Sadece aktif kulüpleri göster
                setClubs(data.filter((c: any) => c.isActive).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    departmentName: c.departmentName || ""
                })));
            }
        } catch (error) {
            console.error("Kulüpler yüklenemedi:", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_URL}/api/Department`);
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch {
            console.error("Bölümler yüklenemedi.");
        }
    };


    useEffect(() => {
        fetchUsers();
        fetchDepartments();  // ⭐ BURAYA EKLENDİ

        if (targetRole === "Student" || targetRole === "ClubManager") {
            fetchClubs();
        }
    }, [targetRole, token]);


    const handleAssignClubManager = async () => {
        if (!checkTokenValidity() || !selectedUserId || !selectedClubId) return;

        try {
            const res = await fetch(`${API_URL}/api/Auth/assign-club-manager/${selectedUserId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ clubId: selectedClubId }),
            });

            if (res.status === 401) {
                alert("🚫 Token geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setSuccessMessage(data.message);
                setShowSuccessModal(true);
                setShowClubModal(false);
                setSelectedUserId(null);
                setSelectedClubId(null);
                fetchUsers(); // Listeyi yenile
                setTimeout(() => setShowSuccessModal(false), 3000);
            } else {
                const errorData = await res.json();
                alert(errorData.message || "❌ İşlem başarısız.");
            }
        } catch (error) {
            alert("🚫 Sunucu bağlantı hatası!");
        }
    };

    const openClubModal = (userId: number) => {
        setSelectedUserId(userId);
        setSelectedClubId(null);
        setShowClubModal(true);
    };

    const handleToggleActive = async (id: number) => {
        if (!checkTokenValidity()) return;
        
        const user = users.find(u => u.id === id);
        const action = user?.isActive ? "pasif" : "aktif";
        
        if (!window.confirm(`Bu kullanıcıyı ${action} etmek istediğinizden emin misiniz?`)) return;

        try {
            const res = await fetch(`${API_URL}/api/Auth/toggle-active/${id}`, {
                method: "PUT",
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
                const data = await res.json();
                // Kullanıcı listesini güncelle
                setUsers(users.map(u => 
                    u.id === id ? { ...u, isActive: data.isActive } : u
                ));
                setSuccessMessage(data.message);
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 2000);
            } else {
                alert("❌ İşlem başarısız.");
            }
        } catch {
            alert("🚫 Sunucu bağlantı hatası!");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Bilinmiyor";
        try {
            const date = new Date(dateString);
            // Sadece tarih göster (GG.AA.YYYY)
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return "Bilinmiyor";
        }
    };

    const getSearchPlaceholder = () => {
        switch (targetRole) {
            case "Student":
                return "Öğrenci Ara...";
            case "Academic":
                return "Akademisyen Ara...";
            case "ClubManager":
                return "Kulüp Yöneticisi Ara...";
            case "Admin":
                return "Yönetici Ara...";
            default:
                return "Kullanıcı Ara...";
        }
    };


    const filteredUsers = users.filter((u) => {
        const deptName = departments.find(d => d.id === (u as any).departmentId)?.name || "";
        const clubName = clubs.find(c => c.id === u.clubId)?.name || "";

        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.surname.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            deptName.toLowerCase().includes(search.toLowerCase());

        // 🎯 Bölüm filtresi (Student, Academic, Admin için)
        const matchDept =
            filterDept === "Hepsi" || deptName === filterDept;

        // 🎯 Kulüp filtresi (Sadece Kulüp Yöneticisi sayfasında)
        const matchClub =
            filterClub === "Hepsi" || clubName === filterClub;

        if (targetRole === "ClubManager") {
            return matchSearch && matchClub;
        }

        // 🎯 Diğer roller (Student, Academic, Admin)
        return matchSearch && matchDept;
    });




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

                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                        {pageTitle}
                    </h1>
                </div>

                <div className="flex items-center gap-4 justify-center mb-6">

                    {/* Arama */}
                    <input
                        type="text"
                        placeholder={getSearchPlaceholder()}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 w-1/3 rounded-lg bg-[#1f1f2f] text-white border border-gray-600 focus:border-blue-500"
                    />


                    {/* Filtre Alanı */}
                    {targetRole === "Student" && (
                        // 🎯 Yalnızca Öğrenci sayfasında Bölüm filtresi
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-[#1f1f2f] text-white border border-gray-600 focus:border-blue-500"
                        >
                            <option value="Hepsi">Tüm Bölümler</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    )}

                    {targetRole === "ClubManager" && (
                        // 🎯 Yalnızca Kulüp Yöneticilerinde kulüp filtresi
                        <select
                            value={filterClub}
                            onChange={(e) => setFilterClub(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-[#1f1f2f] text-white border border-gray-600 focus:border-blue-500"
                        >
                            <option value="Hepsi">Tüm Kulüpler</option>
                            {clubs.map((club) => (
                                <option key={club.id} value={club.name}>{club.name}</option>
                            ))}
                        </select>
                    )}



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
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Bölüm</th>
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Kayıt Tarihi
                                            </th>
                                                    {targetRole === "ClubManager" && (
                                                        <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">
                                                            Yönettiği Kulüp
                                                        </th>
                                                    )}
                                            <th className="py-4 px-6 text-center text-lg font-bold text-[#3b82f6]">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filteredUsers.map((user) => (
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
                                                <td className="py-4 px-6 text-gray-300">
                                                    {departments.find(d => d.id === (user as any).departmentId)?.name || "-"}
                                                </td>
                                                <td className="py-4 px-6 text-gray-300 text-sm">{formatDate(user.registrationDate)}</td>
                                                {targetRole === "ClubManager" && (
                                                    <td className="py-4 px-6 text-gray-300">
                                                        {clubs.find(c => c.id === user.clubId)?.name || "—"}
                                                    </td>
                                                )}

                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {targetRole === "Student" && (
                                                            <button
                                                                onClick={() => openClubModal(user.id)}
                                                                className="px-4 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                                                            >
                                                                🎯 Kulüp Yöneticisi Yap
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleToggleActive(user.id)}
                                                            className={`px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                                                                user.isActive
                                                                    ? "bg-green-600 hover:bg-green-700"
                                                                    : "bg-red-600 hover:bg-red-700"
                                                            }`}
                                                        >
                                                            {user.isActive ? "✅ Aktif" : "⏸️ Pasif"}
                                                        </button>
                                                    </div>
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

            {/* 🎯 Kulüp Seçim Modal */}
            {showClubModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-2xl p-8 mx-4 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6 text-white">Kulüp Yöneticisi Ata</h2>
                        <div className="space-y-4">
                            <select
                                value={selectedClubId || ""}
                                onChange={(e) => setSelectedClubId(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] cursor-pointer"
                            >
                                <option value="">Kulüp Seçin *</option>
                                {clubs.map((club) => (
                                    <option key={club.id} value={club.id}>
                                        {club.name} {club.departmentName ? `(${club.departmentName})` : ""}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAssignClubManager}
                                    disabled={!selectedClubId}
                                    className="flex-1 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Ata
                                </button>
                                <button
                                    onClick={() => {
                                        setShowClubModal(false);
                                        setSelectedUserId(null);
                                        setSelectedClubId(null);
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-xl font-bold text-white"
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserListPage;
