import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

interface PastManager {
    id: number;
    userId: number;
    clubName: string;
    removedAt: string;
}

interface UserInfo {
    id: number;
    name: string;
    surname: string;
    email: string;
    departmentName: string;
}

const PastManagersPage: React.FC = () => {
    const [data, setData] = useState<PastManager[]>([]);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [finalList, setFinalList] = useState<any[]>([]);
    const [activeManagers, setActiveManagers] = useState<number[]>([]);
    const [search, setSearch] = useState("");
    const [clubFilter, setClubFilter] = useState("Hepsi");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    // Aktif Kulüp Yöneticilerini Çek
    const fetchActiveManagers = async () => {
        const res = await fetch(`${API_URL}/api/Admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const list = await res.json();

        const active = list
            .filter((u: any) => u.role === "ClubManager")
            .map((u: any) => u.id);

        setActiveManagers(active);
    };


    const fetchUsers = async () => {
        const res = await fetch(`${API_URL}/api/Admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const list = await res.json();

        const mapped = list.map((u: any) => ({
            id: u.id,
            name: u.name,
            surname: u.surname,
            email: u.email,
            departmentName: u.departmentName,
        }));

        setUsers(mapped);
    };


    const fetchPastManagers = async () => {
        const res = await fetch(`${API_URL}/api/Admin/past-managers`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const list = await res.json();
        setData(list);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
        fetchPastManagers();
        fetchActiveManagers(); 
    }, []);

    const formatDate = (dateStr: string) => {
        const dt = new Date(dateStr);
        return dt.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    useEffect(() => {
        if (data.length === 0 || users.length === 0) return;

        const map = new Map<string, PastManager>();

        data.forEach((pm) => {
            const key = `${pm.userId}-${pm.clubName}`;
            const existing = map.get(key);

            if (!existing || new Date(pm.removedAt) > new Date(existing.removedAt)) {
                map.set(key, pm);
            }
        });

        const merged = Array.from(map.values()).map((pm) => {
            const u = users.find((x) => x.id === pm.userId);

            return {
                ...pm,
                name: u?.name || "",
                surname: u?.surname || "",
                email: u?.email || "",
                departmentName: u?.departmentName || "",
            };
        });

        setFinalList(merged);
    }, [data, users]);

    const filtered = finalList.filter((item) => {
        const fullName = `${item.name} ${item.surname}`.toLowerCase();
        const dept = item.departmentName?.toLowerCase() || "";
        const mail = item.email.toLowerCase();
        const club = item.clubName.toLowerCase();

        const matchesSearch =
            fullName.includes(search.toLowerCase()) ||
            mail.includes(search.toLowerCase()) ||
            dept.includes(search.toLowerCase());

        const matchesClub = clubFilter === "Hepsi" || item.clubName === clubFilter;

        return matchesSearch && matchesClub;
    });

    const clubOptions = ["Hepsi", ...Array.from(new Set(finalList.map((x) => x.clubName)))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white py-12 px-6 relative overflow-hidden">

            {/* Arka plan */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#3b82f6] rounded-full animate-ping"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${2 + Math.random() * 2}s`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    ></div>
                ))}
            </div>

            <div className="text-center mb-12 relative z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] flex items-center justify-center mx-auto shadow-xl mb-6">
                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>

                <h1 className="text-5xl font-bold bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] text-transparent bg-clip-text">
                    Geçmiş Kulüp Yöneticileri
                </h1>
            </div>

            {/* Arama - Filtre */}
            <div className="flex justify-center gap-4 mb-8 relative z-10">
                <input
                    type="text"
                    placeholder="Ad, Soyad, E-posta, Bölüm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-3 w-1/3 bg-[#1f1f2f] rounded-lg border border-gray-600 text-white focus:border-blue-500"
                />

                <select
                    value={clubFilter}
                    onChange={(e) => setClubFilter(e.target.value)}
                    className="px-4 py-3 bg-[#1f1f2f] rounded-lg border border-gray-600 text-white"
                >
                    {clubOptions.map((c) => (
                        <option key={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* TABLO */}
            <div className="w-full max-w-[1600px] mx-auto bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e]rounded-xl border-2 border-transparent hover:border-[#3b82f6] transition shadow-xl p-1 relative z-10">



                <div className="bg-[#0f0f1a] rounded-xl p-6">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">Kayıt bulunamadı.</div>
                    ) : (
                        <table className="min-w-full table-auto whitespace-nowrap">
                            <thead>
                                <tr className="bg-[#151526] border-b border-[#3b82f6]/40">
                                    <th className="py-5 px-8 text-left text-lg font-bold text-[#3b82f6]">Ad-Soyad</th>
                                    <th className="py-5 px-8 text-left text-lg font-bold text-[#3b82f6]">E-posta</th>
                                    <th className="py-5 px-8 text-left text-lg font-bold text-[#3b82f6]">Bölüm</th>
                                    <th className="py-5 px-8 text-left text-lg font-bold text-[#3b82f6]">Kulüp</th>
                                    <th className="py-5 px-8 text-left text-lg font-bold text-[#3b82f6]">Alınma Tarihi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] hover:from-[#2a2a3e] hover:to-[#3a3a4e] transition"
                                    >
                                        <td className="py-4 px-6 max-w-[320px]">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] flex items-center justify-center">
                                                    <span className="text-white font-bold">
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>

                                                {/* İsim */}
                                                <span className="truncate">
                                                    {item.name} {item.surname}
                                                </span>

                                                {/* Badge */}
                                                {activeManagers.includes(item.userId) && (
                                                    <span
                                                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md
                           bg-gradient-to-r from-[#3b82f6] to-[#2d1b69]
                           text-white shadow-md border border-[#3b82f6]/40
                           whitespace-nowrap ml-2"
                                                    >
                                                        ⭐ Yeniden Yönetici
                                                    </span>
                                                )}
                                            </div>
                                        </td>


                                        <td className="py-4 px-6 text-gray-300">{item.email}</td>
                                        <td className="py-4 px-6 text-gray-300">{item.departmentName}</td>
                                        <td className="py-4 px-6 text-gray-300">{item.clubName}</td>
                                        <td className="py-4 px-6 text-gray-300">{formatDate(item.removedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PastManagersPage;
