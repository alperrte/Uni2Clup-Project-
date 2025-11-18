import React, { useEffect, useState, useMemo } from "react";
import axios, { AxiosError } from "axios";

interface Application {
    id: number;
    name: string;
    surname: string;
    email: string;
    departmentId?: number;
    department: string;
    status: string;
    createdAt: string;
}

type StatusFilter = "Tümü" | "Beklemede" | "Onaylandı" | "Reddedildi";
type SortField = "name" | "email" | null;
type SortOrder = "asc" | "desc" | null;

const StudentApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("Tümü");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    const api = axios.create({
        baseURL: "http://localhost:8080/api/Auth",
    });

    const fetchApplications = async (): Promise<void> => {
        try {
            setLoading(true);
            const res = await api.get<Application[]>("/get-applications");
            setApplications(res.data);
        } catch (err: unknown) {
            const axiosError = err as AxiosError;
            console.error("Başvuru alma hatası:", axiosError.message);
            setError("Başvurular alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number): Promise<void> => {
        if (!window.confirm("Bu başvuruyu onaylamak istediğinizden emin misiniz?")) return;
        
        try {
            await api.post(`/approve/${id}`);
            await fetchApplications();
            alert("✅ Başvuru onaylandı ve kullanıcı oluşturuldu.");
        } catch (err: unknown) {
            console.error("Onay hatası:", err);
            alert("❌ Onay işlemi başarısız oldu.");
        }
    };

    const handleReject = async (id: number): Promise<void> => {
        if (!window.confirm("Bu başvuruyu reddetmek istediğinizden emin misiniz?")) return;
        
        try {
            await api.post(`/reject/${id}`);
            await fetchApplications();
            alert("🚫 Başvuru reddedildi.");
        } catch (err: unknown) {
            console.error("Reddetme hatası:", err);
            alert("❌ Reddetme işlemi başarısız oldu.");
        }
    };

    // Filtreleme ve Sıralama
    const filteredAndSortedApplications = useMemo(() => {
        let filtered = applications;

        // Durum filtresi
        if (statusFilter !== "Tümü") {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        // Sıralama
        if (sortField && sortOrder) {
            filtered = [...filtered].sort((a, b) => {
                let aValue: string;
                let bValue: string;

                if (sortField === "name") {
                    aValue = `${a.name} ${a.surname}`.toLowerCase();
                    bValue = `${b.name} ${b.surname}`.toLowerCase();
                } else if (sortField === "email") {
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                } else {
                    return 0;
                }

                if (sortOrder === "asc") {
                    return aValue.localeCompare(bValue, "tr");
                } else {
                    return bValue.localeCompare(aValue, "tr");
                }
            });
        }

        return filtered;
    }, [applications, statusFilter, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Aynı field'a tıklandıysa sıralama yönünü değiştir
            if (sortOrder === "asc") {
                setSortOrder("desc");
            } else if (sortOrder === "desc") {
                setSortField(null);
                setSortOrder(null);
            }
        } else {
            // Yeni field'a tıklandıysa artan sırala
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return "⇅";
        if (sortOrder === "asc") return "↑";
        if (sortOrder === "desc") return "↓";
        return "⇅";
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return "Bilinmiyor";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return "Bilinmiyor";
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Onaylandı":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-600/30 text-green-300 border border-green-500">
                        ✅ Onaylandı
                    </span>
                );
            case "Reddedildi":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-600/30 text-red-300 border border-red-500">
                        ❌ Reddedildi
                    </span>
                );
            case "Beklemede":
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-600/30 text-yellow-300 border border-yellow-500">
                        ⏳ Beklemede
                    </span>
                );
            default:
                return <span className="text-gray-400">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-300 text-lg">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl">{error}</p>
                </div>
            </div>
        );
    }

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

            <div className="relative z-10 w-full max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                        Öğrenci Başvuruları
                    </h1>
                </div>

                {/* Filtreler ve Sıralama */}
                <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                    {/* Durum Filtresi */}
                    <div className="flex items-center gap-2">
                        <label className="text-gray-300 font-semibold">Durum:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                            className="bg-[#1a1a2e] border border-[#3b82f6]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] cursor-pointer"
                        >
                            <option value="Tümü">Tümü</option>
                            <option value="Beklemede">Beklemede</option>
                            <option value="Onaylandı">Onaylandı</option>
                            <option value="Reddedildi">Reddedildi</option>
                        </select>
                    </div>

                    {/* Sıralama */}
                    <div className="flex items-center gap-2">
                        <label className="text-gray-300 font-semibold">Sırala:</label>
                        <button
                            onClick={() => handleSort("name")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                sortField === "name"
                                    ? "bg-[#3b82f6] text-white"
                                    : "bg-[#1a1a2e] text-gray-300 border border-[#3b82f6]/30 hover:bg-[#3b82f6]/20"
                            }`}
                        >
                            İsim {getSortIcon("name")}
                        </button>
                        <button
                            onClick={() => handleSort("email")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                sortField === "email"
                                    ? "bg-[#3b82f6] text-white"
                                    : "bg-[#1a1a2e] text-gray-300 border border-[#3b82f6]/30 hover:bg-[#3b82f6]/20"
                            }`}
                        >
                            E-posta {getSortIcon("email")}
                        </button>
                    </div>
                </div>

                {/* Başvuru Listesi */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                    <div className="bg-[#0f0f1a] rounded-lg p-6">
                        {filteredAndSortedApplications.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                </div>
                                <p className="text-gray-400 text-lg">
                                    {statusFilter === "Tümü" 
                                        ? "Henüz başvuru bulunmamaktadır." 
                                        : `${statusFilter} durumunda başvuru bulunmamaktadır.`}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-b-2 border-[#3b82f6]">
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Ad Soyad</th>
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">E-posta</th>
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Bölüm</th>
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Durum</th>
                                            <th className="py-4 px-6 text-left text-lg font-bold text-[#3b82f6]">Başvuru Tarihi</th>
                                            <th className="py-4 px-6 text-center text-lg font-bold text-[#3b82f6]">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {filteredAndSortedApplications.map((app) => (
                                            <tr
                                                key={app.id}
                                                className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] hover:from-[#2a2a3e] hover:to-[#3a3a4e] transition-all duration-300 group"
                                            >
                                                <td className="py-4 px-6 font-medium text-white text-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-sm">
                                                                {app.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span>{app.name} {app.surname}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-300">{app.email}</td>
                                                <td className="py-4 px-6 text-gray-300">{app.department}</td>
                                                <td className="py-4 px-6">{getStatusBadge(app.status)}</td>
                                                <td className="py-4 px-6 text-gray-300 text-sm">{formatDate(app.createdAt)}</td>
                                                <td className="py-4 px-6 text-center">
                                                    {app.status === "Beklemede" ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleApprove(app.id)}
                                                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                                                            >
                                                                ✅ Onayla
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(app.id)}
                                                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                                                            >
                                                                ❌ Reddet
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            {app.status === "Onaylandı" ? "✅ İşlem Tamamlandı" : "❌ İşlem Tamamlandı"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* İstatistik */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6]/30 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-white">{applications.length}</div>
                        <div className="text-gray-400 text-sm mt-1">Toplam Başvuru</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-yellow-500/30 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-300">
                            {applications.filter(a => a.status === "Beklemede").length}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">Beklemede</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-green-500/30 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-300">
                            {applications.filter(a => a.status === "Onaylandı").length}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">Onaylandı</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-red-500/30 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-300">
                            {applications.filter(a => a.status === "Reddedildi").length}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">Reddedildi</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentApplicationsPage;