import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";
const token = localStorage.getItem("token");
const TURKEY_TIMEZONE = "Europe/Istanbul";

const announcementFormatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: TURKEY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
});

interface EventItem {
    id: number;
    name: string;
}

const parseAnnouncementDate = (value: string) => {
    if (!value) return null;
    const hasTimezone = /Z|[+-]\d{2}:\d{2}$/i.test(value);
    const normalized = hasTimezone ? value : `${value}Z`;
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
};

const formatAnnouncementDate = (value: string) => {
    const date = parseAnnouncementDate(value);
    if (!date) return value;
    return announcementFormatter.format(date);
};

const CreateAnnouncementPage: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch(`${API_URL}/api/Events/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                const normalized = (data || []).map((ev: any) => ({
                    id: ev.id ?? ev.Id,
                    name: ev.name ?? ev.Name,
                }));
                setEvents(normalized);
            } catch (err) {
                console.error("Etkinlik listesi alınamadı:", err);
            }
        };

        const fetchAnnouncements = async () => {
            try {
                const res = await fetch(`${API_URL}/api/announcements/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                setAnnouncements(data);
            } catch (err) {
                console.error("Duyuru listesi alınamadı:", err);
            }
        };

        fetchEvents();
        fetchAnnouncements();
    }, []);


    const handleSubmit = () => {
        if (!selectedEventId || !message.trim()) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }


        setShowConfirm(true);
    };


    const createAnnouncement = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcements/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    eventId: selectedEventId,
                    message: message,
                }),
            });

            await res.json();


            setShowSuccess(true);


            setSelectedEventId(null);
            setMessage("");

 
            const listRes = await fetch(`${API_URL}/api/announcements/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const listData = await listRes.json();
            setAnnouncements(listData);
        } catch (err) {
            console.error("Duyuru oluşturma hatası:", err);
            alert("Bir hata oluştu.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 text-white">
            <h1 className="text-4xl font-bold mb-8 text-center">📢 Duyuru Oluştur</h1>

            <div className="bg-[#0f0f1a] p-6 rounded-xl border border-[#3b82f6]">
                {/* Etkinlik seçimi */}
                <label className="block mb-2 text-lg">Mevcut Etkinliği Seç</label>
                <select
                    className="w-full p-3 rounded bg-[#1a1a2e] border border-[#3b82f6]"
                    value={selectedEventId ?? ""}
                    onChange={(e) =>
                        setSelectedEventId(
                            e.target.value ? Number(e.target.value) : null
                        )
                    }
                >
                    <option value="">Etkinlik seç...</option>
                    {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                            {ev.name}
                        </option>
                    ))}
                </select>

                {/* Mesaj */}
                <label className="block mt-4 mb-2 text-lg">Etkinlik Hakkında</label>
                <textarea
                    className="w-full h-32 p-3 rounded bg-[#1a1a2e] border border-[#3b82f6]"
                    placeholder="Duyuru metnini yaz..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                {/* Buton → sadece handleSubmit çağırır */}
                <button
                    onClick={handleSubmit}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-white text-lg"
                >
                    Duyuru Oluştur
                </button>
            </div>

            {/* DUYURU LİSTESİ */}
            <h2 className="text-3xl font-semibold mb-4 mt-10">📄 Mevcut Duyurular</h2>

            {announcements.length === 0 ? (
                <p className="text-gray-400">Henüz duyuru oluşturulmadı.</p>
            ) : (
                <div className="space-y-4">
                    {announcements.map((a) => (
                        <div
                            key={a.id}
                            className="bg-[#1a1a2e] p-4 rounded border border-[#3b82f6]"
                        >
                            <h3 className="text-xl font-bold">{a.EventName}</h3>
                            <p className="mt-2">{a.Message}</p>
                            <p className="mt-1 text-sm text-gray-400">
                                {formatAnnouncementDate(a.CreatedAt)}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* EMİN MİSİN MODALI */}
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
                                onClick={() => {
                                    setShowConfirm(false);
                                    createAnnouncement();
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                            >
                                Onayla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BAŞARI MODALI */}
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

export default CreateAnnouncementPage;
