import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

interface EventItem {
    id: number;
    name: string;
}

const AnnouncementsPage: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState<string | null>(null);

    // 💜 Modal stateleri
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);

    useEffect(() => {
        if (!token) return;

        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/api/events/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    console.log("Etkinlik listesi alınamadı:", res.status);
                    return;
                }

                const data = await res.json();
                const normalized = data.map((e: any) => ({
                    id: e.id ?? e.Id,
                    name: e.name ?? e.Name
                }));

                setEvents(normalized);
            } catch (err) {
                console.error("Etkinlik listesi alınamadı:", err);
            }
        };

        fetchEvents();
    }, [token]);

    // 💜 İlk basınca → sadece emin misiniz modalı açılıyor
    const handleSubmit = () => {
        if (!selectedEventId || !message.trim()) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }
        setShowConfirm(true);
    };

    // 💜 Onayla → backend’e kaydeder → başarı modalını açar
    const createAnnouncement = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcements/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    eventId: Number(selectedEventId),
                    message
                }),
            });

            await res.json();

            // Modal akışı
            setShowConfirm(false);
            setShowSuccess(true);

            // Form temizleme
            setSelectedEventId("");
            setMessage("");

        } catch (err) {
            console.error("Duyuru oluşturma hatası:", err);
        }
    };

    return (
        <div className="relative text-white">
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"></div>

            <div className="max-w-5xl mx-auto py-10 space-y-10">

                {/* ÜST KUTU */}
                <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] border border-[#3b82f6]/30 rounded-3xl p-8 shadow-2xl">
                    <p className="text-sm uppercase tracking-[0.4em] text-[#93c5fd] mb-2">Kulüp Duyuruları</p>
                    <h1 className="text-4xl font-extrabold">Duyuru Oluştur</h1>
                    <p className="text-gray-300 mt-3 max-w-2xl">
                        Etkinlikleriniz hakkında kulüp üyelerinize hızlıca bilgi verin bir duyuru oluşturun.
                    </p>
                </div>

                {/* FORM */}
                <div className="bg-[#0f0f1a]/90 border border-[#3b82f6]/40 rounded-3xl p-8 shadow-2xl space-y-6">

                    <label className="block text-lg font-semibold">Mevcut Etkinliği Seç</label>
                    <select
                        className="w-full p-4 rounded-2xl bg-[#161a3a] border border-[#3b82f6]/40 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        <option value="">Etkinlik seç...</option>
                        {events.map(ev => (
                            <option key={ev.id} value={ev.id}>
                                {ev.name}
                            </option>
                        ))}
                    </select>

                    <label className="block text-lg font-semibold">Duyuru Mesajı</label>
                    <textarea
                        className="w-full h-36 p-4 rounded-2xl bg-[#161a3a] border border-[#3b82f6]/40 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none"
                        placeholder="Duyuru metnini yaz..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <button
                        onClick={handleSubmit}
                        className="w-full mt-4 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:scale-[1.01] transition-all font-semibold py-4 rounded-2xl shadow-lg"
                    >
                        Duyuru Oluştur
                    </button>
                </div>
            </div>

            {/* 💜 1) EMİN MİSİN MODALI */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#1a1a2e] p-8 rounded-2xl w-[90%] max-w-md border border-blue-400/30 text-center shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Duyuru oluşturmak istiyor musunuz?
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Bu işlemi onayladığınızda duyuru oluşturulacaktır.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold"
                            >
                                İptal
                            </button>

                            <button
                                onClick={createAnnouncement}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                            >
                                Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 💜 2) BAŞARI MODALI */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#1a1a2e] p-8 rounded-2xl w-[90%] max-w-md border border-blue-400/30 text-center shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            ✔ Duyuru başarıyla oluşturuldu
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Yeni duyurunuz sisteme kaydedildi.
                        </p>

                        <button
                            onClick={() => setShowSuccess(false)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AnnouncementsPage;
