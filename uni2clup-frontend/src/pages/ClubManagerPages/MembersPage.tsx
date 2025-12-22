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

    const [removeModalOpen, setRemoveModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [removeReason, setRemoveReason] = useState("");
    const [search, setSearch] = useState("");

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

    useEffect(() => {
        fetchMembers();
    }, []);

    const filtered = members.filter((m) => {
        const query = search.toLowerCase();
        return (
            m.name.toLowerCase().includes(query) ||
            m.surname.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query) ||
            m.email.split("@")[0].includes(query)
        );
    });

    const openRemoveModal = (userId: number) => {
        setSelectedUserId(userId);
        setRemoveReason("");
        setRemoveModalOpen(true);
    };

    const handleRemoveConfirm = () => {
        setRemoveModalOpen(false);
        setConfirmModalOpen(true);
    };

    const removeMember = async () => {
        if (!selectedUserId || !removeReason.trim()) return;

        const token = localStorage.getItem("token");

        const res = await fetch(
            `${API_URL}/api/Club/members/remove/${selectedUserId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: removeReason }),
            }
        );

        if (res.ok) {
            setConfirmModalOpen(false);
            await fetchMembers();
        } else {
            alert("Üye çıkarılamadı!");
        }
    };

    return (
        <div className="relative text-white">
            {/* Background */}
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-br 
                            from-indigo-900 via-purple-900 to-blue-900"></div>

            <div className="max-w-5xl mx-auto py-10 space-y-10">
                {/* Başlık */}
                <div className="relative bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a] border border-[#3b82f6]/40 shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:shadow-[#3b82f6]/30 hover:scale-[1.01] transition-all duration-300 rounded-3xl p-8 overflow-hidden">

                    <h1 className="text-4xl font-extrabold mb-3">Kulüp Üyeleri</h1>
                    <p className="text-gray-300">
                        Üyeleri görüntüleyebilir ve kulüpten çıkarabilirsiniz.
                    </p>

                    {/* Arama Kutusu */}
                    <div className="mt-6">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="İsim, soyisim, email veya öğrenci numarası ara..."
                            className="w-full px-5 py-3 bg-[#0a0a1a] text-white border border-[#3b82f6]/40 
                                       rounded-2xl shadow-lg focus:outline-none focus:border-[#3b82f6] 
                                       transition-all"
                        />
                    </div>
                </div>

                {/* LİSTE */}
                {loading ? (
                    <div className="bg-[#0f0f1a]/90 border border-[#3b82f6]/40 rounded-3xl p-8 text-center">
                        Üyeler yükleniyor...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-[#0f0f1a]/90 border border-[#3b82f6]/40 rounded-3xl p-8 text-center">
                        Aramanıza uygun üye bulunamadı.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((member) => (
                            <div
                                key={member.id}
                                className="bg-[#0f0f1a]/90 border border-[#3b82f6]/50 rounded-2xl 
                                           p-6 shadow-xl flex justify-between items-center"
                            >
                                {/* SOL BİLGİLER */}
                                <div className="space-y-2 text-[16px] leading-relaxed">
                                    <p>
                                        👤 <span className="font-semibold">Ad - Soyad:</span>{" "}
                                        {member.name} {member.surname}
                                    </p>

                                    <p>
                                        📧 <span className="font-semibold">Email:</span>{" "}
                                        {member.email}
                                    </p>

                                    <p>
                                        🎓 <span className="font-semibold">Öğrenci No:</span>{" "}
                                        {member.email.split("@")[0]}
                                    </p>

                                    <p>
                                        📅 <span className="font-semibold">Üyelik Tarihi:</span>{" "}
                                        {new Date(member.createdAt).toLocaleDateString("tr-TR")}
                                    </p>
                                </div>

                                {/* Çıkar Butonu */}
                                <button
                                    onClick={() => openRemoveModal(member.id)}
                                    className="px-5 py-3 bg-red-600 text-white rounded-xl 
                                               shadow-lg hover:bg-red-700 transition"
                                >
                                    ❌ Kulüpten Çıkar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Çıkarma Nedeni Modal */}
            {removeModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a2e] p-6 rounded-xl w-full max-w-md border border-[#3b82f6]">
                        <h2 className="text-xl font-bold mb-4">Çıkarma Nedeni</h2>

                        <textarea
                            value={removeReason}
                            onChange={(e) => setRemoveReason(e.target.value)}
                            placeholder="Kulüpten çıkarma sebebini yazınız..."
                            className="w-full p-3 bg-[#0f0f1a] text-white rounded-xl border border-[#3b82f6]/40"
                            rows={4}
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setRemoveModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 rounded-xl"
                            >
                                Vazgeç
                            </button>

                            <button
                                onClick={handleRemoveConfirm}
                                className="px-4 py-2 bg-red-600 rounded-xl"
                            >
                                Devam Et
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Emin misiniz Modal */}
            {confirmModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a2e] p-6 rounded-xl w-full max-w-md border border-red-500">
                        <h2 className="text-xl font-bold mb-4">Emin misiniz?</h2>

                        <p className="text-gray-300 mb-6">
                            Bu üyeyi kulüpten çıkarmak istediğinize emin misiniz?
                            <br />
                            <br />
                            <b>Neden:</b> {removeReason}
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 rounded-xl"
                            >
                                Vazgeç
                            </button>

                            <button
                                onClick={removeMember}
                                className="px-4 py-2 bg-red-600 rounded-xl"
                            >
                                Çıkar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersPage;
