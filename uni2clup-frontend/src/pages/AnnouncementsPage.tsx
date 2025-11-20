import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";
const token = localStorage.getItem("token");

interface EventItem {
    id: number;
    name: string;
}

const AnnouncementsPage: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [message, setMessage] = useState("");

    // 1️⃣ Etkinlikleri Yükle
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/api/Events/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
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
    }, []);

    // 3️⃣ Duyuru Oluşturma
    const handleSubmit = async () => {
        if (!selectedEventId || !message.trim()) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

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
                })
            });

            const data = await res.json();
            alert(data.message || "Duyuru oluşturuldu!");

            setSelectedEventId("");
            setMessage("");

        } catch (err) {
            console.error("Duyuru oluşturma hatası:", err);
            alert("Bir hata oluştu.");
        }
    };

    return (
        <div className="relative text-white">
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"></div>

            <div className="max-w-5xl mx-auto py-10 space-y-10">
                <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] border border-[#3b82f6]/30 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-[#93c5fd] mb-2">Kulüp Duyuruları</p>
                            <h1 className="text-4xl font-extrabold">Duyuru Oluştur</h1>
                            <p className="text-gray-300 mt-3 max-w-2xl">
                                Etkinlikleriniz hakkında kulüp üyelerinize hızlıca bilgi verin bir duyuru oluşturun.
                            </p>
                        </div>
                    </div>
                </div>

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
        </div>
    );
};

export default AnnouncementsPage;