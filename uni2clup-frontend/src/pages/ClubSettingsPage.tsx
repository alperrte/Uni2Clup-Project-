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

    if (loading) {
        return <p className="text-white mt-10">Kulüp bilgileri yükleniyor...</p>;
    }

    if (error) {
        return (
            <div className="text-white mt-10">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchClub}
                    className="px-4 py-2 bg-blue-600 rounded-lg"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    if (!club) {
        return <p className="text-white mt-10">Kulüp bilgisi bulunamadı.</p>;
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 text-white space-y-6">
            <div className="bg-[#0f0f1a] border border-[#3b82f6] rounded-2xl p-6">
                <h1 className="text-3xl font-bold mb-4">{club.name}</h1>
                {club.departmentName && (
                    <p className="text-gray-300 mb-2">
                        Bölüm: {club.departmentName}
                    </p>
                )}
                <p className="text-gray-400">
                    Kulübünüzün açıklamasını aşağıdan güncelleyebilirsiniz.
                </p>
            </div>

            <div className="bg-[#0f0f1a] border border-[#3b82f6] rounded-2xl p-6">
                <label className="block mb-2 text-lg font-semibold">
                    Kulüp Açıklaması
                </label>
                <textarea
                    className="w-full bg-[#1a1a2e] border border-[#3b82f6] rounded-xl p-4 text-white min-h-[160px] resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kulübünüzü anlatan açıklamayı yazın..."
                />
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 py-3 rounded-lg font-semibold"
                >
                    {saving ? "Kaydediliyor..." : "Açıklamayı Güncelle"}
                </button>
            </div>
        </div>
    );
};

export default ClubSettingsPage;

