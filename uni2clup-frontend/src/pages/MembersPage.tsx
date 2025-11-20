import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

interface Member {
    id: number;
    name: string;
    surname: string;
    email: string;
    createdAt: string;
    isActive: boolean;
}

const MembersPage: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        const token = localStorage.getItem("token");
        const clubId = localStorage.getItem("clubId");

        if (!clubId) {
            setLoading(false);
            return;
        }

        const res = await fetch(`${API_URL}/api/Club/${clubId}/members`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setMembers(data);
        setLoading(false);
    };

    const toggleActive = async (userId: number) => {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/Club/members/toggle/${userId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            await fetchMembers();
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    return (
        <div className="relative text-white">
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-br 
                            from-indigo-900 via-purple-900 to-blue-900"></div>

            <div className="max-w-5xl mx-auto py-10 space-y-10">
                <div
                    className="bg-gradient-to-br from-[#1c1f44] to-[#111326] 
                               border border-[#3b82f6]/30 rounded-3xl p-8 shadow-2xl"
                >
                    <h1 className="text-4xl font-extrabold mb-3">Kulüp Üyeleri</h1>
                    <p className="text-gray-300">Üyeleri görüntüleyebilir ve aktif/pasif yapabilirsiniz.</p>
                </div>

                {loading ? (
                    <div className="bg-[#0f0f1a]/90 border border-[#3b82f6]/40 rounded-3xl p-8 text-center">
                        Üyeler yükleniyor...
                    </div>
                ) : members.length === 0 ? (
                    <div className="bg-[#0f0f1a]/90 border border-[#3b82f6]/40 rounded-3xl p-8 text-center">
                        Bu kulüpte henüz üye bulunmamaktadır.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {members.map(member => (
                            <div
                                key={member.id}
                                className="bg-[#0f0f1a]/90 border border-[#3b82f6]/50 
                                    rounded-2xl p-6 shadow-xl flex items-center justify-between
                                    backdrop-blur-md transition shadow-blue-900/30"
                            >
                                {/* Sol Bölüm */}
                                <div className="space-y-2 text-white">
                                    <p className="text-base">
                                        <span className="font-semibold text-white">Ad - Soyad:</span>{" "}
                                        {member.name} {member.surname}
                                    </p>

                                    <p className="text-base">
                                        <span className="font-semibold text-white">E-Mail:</span>{" "}
                                        {member.email}
                                    </p>

                                    <p className="text-base">
                                        <span className="font-semibold text-white">Öğrenci Numarası:</span>{" "}
                                        {member.email.split("@")[0]}
                                    </p>

                                    <p className="text-sm opacity-90">
                                        <span className="font-semibold text-white">Üyelik Tarihi:</span>{" "}
                                        {new Date(member.createdAt).toLocaleDateString("tr-TR")}
                                    </p>
                                </div>

                                {/* Sağ - Toggle */}
                                <div className="flex flex-col items-end">
                                    <span
                                        className={`mb-2 font-semibold ${member.isActive ? "text-green-400" : "text-red-400"
                                            }`}
                                    >
                                        {member.isActive ? "Aktif" : "Pasif"}
                                    </span>

                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={member.isActive}
                                            onChange={() => toggleActive(member.id)}
                                            className="sr-only peer"
                                        />

                                        {/* Toggle Track */}
                                        <div
                                            className={`w-16 h-8 rounded-full transition-all duration-300
                                            border-2 
                                            ${member.isActive
                                                    ? "bg-green-600 border-green-400"
                                                    : "bg-red-600 border-red-400"
                                                }`}
                                        ></div>

                                        {/* White Circle */}
                                        <span
                                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow 
                                            transition-all duration-300 peer-checked:translate-x-8`}
                                        ></span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersPage;
