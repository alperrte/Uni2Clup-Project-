import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";
const token = localStorage.getItem("token");

interface EventItem {
    id: number;
    name: string;
}

interface Announcement {
    id: number;
    message: string;
    createdAt: string;
    eventName: string;
}

const AnnouncementsPage: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [message, setMessage] = useState("");
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

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

    // 2️⃣ Duyuruları Yükle
    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcements/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            setAnnouncements(data);
        } catch (err) {
            console.error("Duyuru listesi alınamadı:", err);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
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

            // ✔ Yeni duyuruyu yükle
            fetchAnnouncements();

        } catch (err) {
            console.error("Duyuru oluşturma hatası:", err);
            alert("Bir hata oluştu.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 text-white">

            <h1 className="text-4xl font-bold mb-8 text-center">📢 Duyuru Oluştur</h1>

            {/* Form */}
            <div className="bg-[#0f0f1a] p-6 rounded-xl border border-[#3b82f6]">

                <label className="block mb-2 text-lg">Mevcut Etkinliği Seç</label>
                <select
                    className="w-full p-3 rounded bg-[#1a1a2e] border border-[#3b82f6]"
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

                <label className="block mt-4 mb-2 text-lg">Etkinlik Hakkında</label>
                <textarea
                    className="w-full h-32 p-3 rounded bg-[#1a1a2e] border border-[#3b82f6]"
                    placeholder="Duyuru metnini yaz..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white text-lg"
                >
                    Duyuru Oluştur
                </button>
            </div>

            {/* Duyuru Listesi */}
            <h2 className="text-3xl font-semibold mt-12 mb-4">📰 Mevcut Duyurular</h2>

            {announcements.length === 0 ? (
                <p className="text-gray-400">Henüz duyuru oluşturulmadı.</p>
            ) : (
                <div className="space-y-4">
                    {announcements.map(a => (
                        <div key={a.id} className="p-4 bg-[#1a1a2e] border border-[#3b82f6] rounded-lg">
                            <h3 className="text-xl text-[#3b82f6] font-bold">{a.eventName}</h3>
                            <p className="mt-2">{a.message}</p>
                            <p className="mt-1 text-gray-400 text-sm">
                                📅 {new Date(a.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default AnnouncementsPage;