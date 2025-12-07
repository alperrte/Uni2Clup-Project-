import React, { useState, useEffect,useCallback } from "react";

const API_URL = "http://localhost:8080";

interface Club {
    id: number;
    name: string;
    departmentId: number;
    departmentName: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    closedAt: string | null;
}

interface Department {
    id: number;
    name: string;
    code?: string;
}

const ClubManagementPage: React.FC = () => {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        departmentId: 0,
        description: "",
    });
    const [departments, setDepartments] = useState<Department[]>([]);

    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("Hepsi");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");


    const token = localStorage.getItem("token")?.trim() || "";

    const fetchClubs = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/Club`, {
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

            const data: Club[] = await res.json();
            setClubs(data);
        } catch (error) {
            console.error("Kulüp listesi alınamadı:", error);
            alert("🚫 Sunucuya bağlanılamadı.");
        } finally {
            setLoading(false);
        }
    }, [token]);


    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_URL}/api/Department`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const data: Department[] = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error("Bölümler yüklenemedi:", error);
        }
    };

    useEffect(() => {
        fetchClubs();
        fetchDepartments();
    }, [fetchClubs]);


    const handleCreate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/Club`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccessMessage("✅Kulüp başarıyla oluşturuldu");
                setShowSuccessModal(true);

                setShowCreateModal(false);
                setFormData({ name: "", departmentId: 0, description: "" });
                fetchClubs();
            } else {
                const data = await res.json();
                alert(data.message || "❌ Kulüp oluşturulamadı.");
            }
        } catch (error) {
            alert("🚫 Sunucu bağlantı hatası!");
        }
    };

    const handleEdit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!token || !editingClub) return;

        try {
            const res = await fetch(`${API_URL}/api/Club/${editingClub.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccessMessage("✅Kulüp başarıyla güncellendi");
                setShowSuccessModal(true);
                
                setShowEditModal(false);
                setEditingClub(null);
                setFormData({ name: "", departmentId: 0, description: "" });
                fetchClubs();
            } else {
                const data = await res.json();
                alert(data.message || "❌ Kulüp güncellenemedi.");
            }
        } catch (error) {
            alert("🚫 Sunucu bağlantı hatası!");
        }
    };

    const handleToggleActive = async (id: number) => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/Club/toggle-active/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setSuccessMessage("✅Kulüp başarıyla silindi");
                setShowSuccessModal(true);

                fetchClubs();
            } else {
                alert("❌ İşlem başarısız.");
            }
        } catch (error) {
            alert("🚫 Sunucu bağlantı hatası!");
        }
    };

    const handleDelete = async (id: number) => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/Club/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok || res.status === 200 || res.status === 204) {
                setSuccessMessage("✅Kulüp başarıyla silindi");
                setShowSuccessModal(true);
                fetchClubs();
            } else {
                alert("❌ Kulüp silinemedi.");
            }
        } catch (error) {
            alert("🚫 Sunucu bağlantı hatası!");
        }
    };

    const openEditModal = (club: Club) => {
        setEditingClub(club);
        setFormData({
            name: club.name,
            departmentId: club.departmentId,
            description: club.description,
        });
        setShowEditModal(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return "-";
        }
    };

    const filteredClubs = clubs.filter((club) => {
        const matchSearch =
            club.name.toLowerCase().includes(search.toLowerCase()) ||
            club.description.toLowerCase().includes(search.toLowerCase());

        const matchDept =
            filterDept === "Hepsi" || club.departmentName === filterDept;

        return matchSearch && matchDept;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-300 text-lg">Yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Başlık */}
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                    Kulüp Yönetimi
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] px-6 py-3 rounded-xl font-bold text-white hover:from-[#3d2b79] hover:to-[#4b92ff] transition-all duration-200 shadow-lg"
                >
                    ➕ Yeni Kulüp Oluştur
                </button>
            </div>

            <div className="flex items-center gap-4 mb-4">

                <input
                    type="text"
                    placeholder="Kulüp Ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[#1f1f2f] text-white border border-gray-600 focus:border-blue-500 w-1/3"
                />

                <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[#1f1f2f] text-white border border-gray-600 focus:border-blue-500"
                >
                    <option value="Hepsi">Tüm Bölümler</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                </select>

            </div>

            {/* Kulüpler */}
            <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                <div className="bg-[#0f0f1a] rounded-lg p-6">
                    {clubs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">Henüz kulüp bulunmamaktadır.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-b-2 border-[#3b82f6]">
                                        <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Kulüp Adı</th>
                                        <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Bölüm</th>
                                        <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Açıklama</th>
                                        <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Durum</th>
                                        <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Açılış Tarihi</th>
                                        <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Kapanış Tarihi</th>
                                        <th className="py-4 px-6 text-center text-lg font-bold text-[#3b82f6]">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredClubs.map((club) => (
                                        <tr
                                            key={club.id}
                                            className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] hover:from-[#2a2a3e] hover:to-[#3a3a4e] transition-all duration-300"
                                        >
                                            <td className="py-4 px-6 font-medium text-white">{club.name}</td>
                                            <td className="py-4 px-6 text-gray-300">{club.departmentName}</td>
                                            <td className="py-4 px-6 text-gray-300 whitespace-normal break-words">
                                                {club.description || "-"}
                                            </td>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => {
                                                        setConfirmMessage(
                                                            club.isActive
                                                                ? `"${club.name}" kulübünü kapatmak istediğinize emin misiniz?`
                                                                : `"${club.name}" kulübünü tekrar açmak istediğinize emin misiniz?`
                                                        );

                                                        setConfirmAction(() => () => handleToggleActive(club.id));
                                                        setShowConfirmModal(true);
                                                    }}
                                                    className={`px-4 py-2 rounded-lg font-semibold text-white transition-all ${club.isActive ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                                                        }`}
                                                >
                                                    {club.isActive ? "✅ Aktif" : "⏸️ Pasif"}
                                                </button>

                                            </td>
                                            <td className="py-4 px-6 text-gray-300 text-sm">{formatDate(club.createdAt)}</td>
                                            <td className="py-4 px-6 text-gray-300 text-sm">
                                                {club.isActive ? "-" : formatDate(club.closedAt || "")}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(club)}
                                                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold text-white transition-all"
                                                    >
                                                        ✏️ Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmMessage(`"${club.name}" kulübünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
                                                            setConfirmAction(() => () => handleDelete(club.id));
                                                            setShowConfirmModal(true);
                                                        }}
                                                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold text-white transition-all"
                                                    >
                                                        🗑️ Sil
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

            {/* Oluştur Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a2e] p-8 rounded-xl border border-[#3b82f6] max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">Yeni Kulüp Oluştur</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Kulüp Adı *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                            />
                            <select
                                value={formData.departmentId}
                                onChange={(e) => setFormData({ ...formData, departmentId: parseInt(e.target.value) })}
                                required
                                className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] cursor-pointer"
                            >
                                <option value={0}>Bölüm Seçin *</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            <textarea
                                placeholder="Açıklama"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmMessage("Bu kulübü oluşturmak istediğinize emin misiniz?");
                                        setConfirmAction(() => () => handleCreate());
                                        setShowConfirmModal(true);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] py-3 rounded-xl font-bold text-white"
                                >
                                    Oluştur
                                </button>


                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFormData({ name: "", departmentId: 0, description: "" });
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-xl font-bold text-white"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
                    <div className="bg-[#1a1a2e] p-8 rounded-xl border border-[#3b82f6] max-w-md w-full mx-4">

                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Onay Gerekli</h2>

                        <p className="text-gray-300 mb-8 text-center text-lg">
                            {confirmMessage}
                        </p>

                        <div className="flex gap-4">
                            <button
                                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold text-white"
                                onClick={() => {
                                    if (confirmAction) confirmAction();
                                    setShowConfirmModal(false);
                                }}
                            >
                                Evet
                            </button>
                            <button
                                className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold text-white"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Hayır
                            </button>
                        </div>

                    </div>
                </div>
            )}



            {/* Edit Modal */}
            {showEditModal && editingClub && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a2e] p-8 rounded-xl border border-[#3b82f6] max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">Kulüp Düzenle</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Kulüp Adı *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                            />
                            <select
                                value={formData.departmentId}
                                onChange={(e) => setFormData({ ...formData, departmentId: parseInt(e.target.value) })}
                                required
                                className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] cursor-pointer"
                            >
                                <option value={0}>Bölüm Seçin *</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            <textarea
                                placeholder="Açıklama"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmMessage("Bu kulübün bilgilerini güncellemek istediğinize emin misiniz?");
                                        setConfirmAction(() => () => handleEdit());
                                        setShowConfirmModal(true);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] py-3 rounded-xl font-bold text-white"
                                >
                                    Güncelle
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingClub(null);
                                        setFormData({ name: "", departmentId: 0, description: "" });
                                    }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-xl font-bold text-white"
                                >
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
                    <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-[#3b82f6]/30 shadow-2xl w-[90%] max-w-md text-center">

                        <h2 className="text-2xl font-bold text-white mb-4">
                            {successMessage}
                        </h2>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="mt-4 bg-[#4e3df5] hover:bg-[#3f2de8] text-white px-6 py-3 rounded-xl font-semibold transition"
                        >
                            Tamam
                        </button>

                    </div>
                </div>
            )}


        </div>
    );
};

export default ClubManagementPage;

