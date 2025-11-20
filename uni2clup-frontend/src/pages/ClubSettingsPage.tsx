import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

interface ClubInfo {
    id: number;
    name: string;
    description: string;
    departmentName?: string;
}

const ClubSettingsPage: React.FC = () => {
    const [club, setClub] = useState<ClubInfo | null>(null);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    const fetchClub = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_URL}/api/Club/my-club`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Kulüp bilgisi alınamadı.");
            }

            const data = await res.json();
            setClub(data);
            setDescription(data?.description || "");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Kulüp bilgisi alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        if (!club) return;
        try {
            setSaving(true);
            const res = await fetch(`${API_URL}/api/Club/update-description`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ description })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Açıklama güncellenemedi.");
            }

            alert(data.message || "Açıklama güncellendi.");
            setClub({ ...club, description });
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Açıklama güncellenemedi.");
        } finally {
            setSaving(false);
        }
    };

    const renderStateCard = (content: React.ReactNode, action?: React.ReactNode) => (
        <div className="bg-[#0f0f1a]/80 border border-[#3b82f6]/30 rounded-3xl p-10 text-white space-y-4 text-center">
            {content}
            {action}
        </div>
    );

    if (loading) {
        return renderStateCard(<p className="text-gray-300">Kulüp bilgileri yükleniyor...</p>);
    }

    if (error) {
        return renderStateCard(
            <p className="text-red-300">{error}</p>,
            <button
                onClick={fetchClub}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ef4444] to-[#b91c1c] font-semibold"
            >
                Tekrar Dene
            </button>
        );
    }

    if (!club) {
        return renderStateCard(<p className="text-gray-300">Kulüp bilgisi bulunamadı.</p>);
    }

    return (
        <div className="relative text-white">
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"></div>
            <div className="max-w-5xl mx-auto py-10 space-y-8">
                <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] border border-[#3b82f6]/30 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-[#93c5fd] mb-2">Kulüp Ayarları</p>
                            <h1 className="text-4xl font-extrabold">{club.name}</h1>
                            <p className="text-gray-300 mt-3 max-w-2xl">
                                Kulüp açıklaması üyelerin kulüp sayfasında görüntülenecektir, buradan kulüp açıklamanızı düzenleyebilirsiniz. Kulüp ismi ve bölüm değişikliği için lütfen üniversite yönetimi ile iletişime geçin.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f0f1a]/90 border border-[#3b82f6]/40 rounded-3xl p-8 shadow-2xl">
                    <label className="block mb-2 text-lg font-semibold">
                        Kulüp Açıklaması
                    </label>
                    <textarea
                        className="w-full bg-[#161a3a] border border-[#3b82f6]/40 rounded-2xl p-5 text-white min-h-[180px] resize-none focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Kulübünüzün misyonunu, vizyonunu ve faaliyet alanlarını anlatan açıklamayı yazın..."
                    />
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-5 w-full bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:scale-[1.01] transition-all font-semibold py-4 rounded-2xl shadow-lg disabled:opacity-60"
                    >
                        {saving ? "Kaydediliyor..." : "Açıklamayı Güncelle"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClubSettingsPage;

