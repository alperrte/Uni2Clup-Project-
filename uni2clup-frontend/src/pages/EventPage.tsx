import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface Event {
    id: number;
    Name: string;
    Capacity: number;
    Location: string;
    StartDate: string;
    EndDate: string;
    ClubName: string;
    Description: string;
}

const EventPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filter, setFilter] = useState("Tümü");
    const [open, setOpen] = useState(false);

    const API_URL = "http://localhost:8080";
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const getStatus = (start: string, end: string) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);

        if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Tarih Hatalı";
        if (now < s) return "Başlamadı";
        if (now > e) return "Bitti";
        return "Devam Ediyor";
    };

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/Events/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            const normalized = data.map((e: any) => ({
                id: e.id ?? e.Id,
                Name: e.name ?? e.Name,
                Capacity: e.capacity ?? e.Capacity,
                Location: e.location ?? e.Location,
                StartDate: e.startDate ?? e.StartDate,
                EndDate: e.endDate ?? e.EndDate,
                ClubName: e.clubName ?? e.ClubName,
                Description: e.description ?? e.Description,
            }));

            setEvents(normalized);
        } catch (e) {
            console.error("Etkinlikler yüklenemedi:", e);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const onDelete = async (id: number) => {
        if (!window.confirm("Bu etkinliği silmek istiyor musun?")) return;

        try {
            await fetch(`${API_URL}/api/Events/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchEvents();
        } catch (err) {
            console.error("Silme hatası:", err);
        }
    };

    const onEdit = (ev: Event) => {
        navigate("/club/create-event", { state: { event: ev } });
    };

    const filtered = events.filter(ev => {
        const status = getStatus(ev.StartDate, ev.EndDate);
        if (filter === "Tümü") return true;
        return filter === status;
    });

    return (
        <div className="max-w-6xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl text-white font-bold">📅 Etkinlik Listesi</h1>

                <div className="relative z-50">
                    <button
                        onClick={() => setOpen(!open)}
                        className="bg-blue-700 px-4 py-2 rounded-lg"
                    >
                        {filter} ⌄
                    </button>

                    {open && (
                        <div className="absolute right-0 bg-[#0f0f1a] border border-[#3b82f6] rounded-lg mt-2 w-40">
                            {["Tümü", "Devam Ediyor", "Başlamadı", "Bitti"].map(item => (
                                <button
                                    key={item}
                                    onClick={() => {
                                        setFilter(item);
                                        setOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-[#3b82f6]"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <p className="text-white">Yükleniyor...</p>
            ) : filtered.length === 0 ? (
                <p className="text-gray-400">Gösterilecek etkinlik bulunamadı.</p>
            ) : (
                <div className="space-y-4">
                    {filtered.map(ev => {
                        const status = getStatus(ev.StartDate, ev.EndDate);

                        const color =
                            status === "Devam Ediyor" ? "bg-green-600"
                                : status === "Başlamadı" ? "bg-yellow-600"
                                    : "bg-red-600";

                        return (
                            <div
                                key={ev.id}
                                className="p-6 rounded-xl bg-[#1a1a2e] border border-[#3b82f6] relative"
                            >
                                <span className={`${color} absolute top-3 right-3 px-3 py-1 rounded-full text-sm`}>
                                    {status}
                                </span>

                                <h3 className="text-xl text-[#3b82f6] font-bold">{ev.Name}</h3>
                                <p className="text-gray-300 mt-1">📍 {ev.Location}</p>
                                <p className="text-gray-300">👥 Kontenjan: {ev.Capacity}</p>
                                <p className="text-gray-300">🏛 {ev.ClubName}</p>
                                <p className="text-gray-300 mt-2">
                                    📅 {ev.StartDate} — {ev.EndDate}
                                </p>
                                <p className="text-gray-400 italic mt-2">“{ev.Description}”</p>

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => onEdit(ev)}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                                    >
                                        ✏️ Düzenle
                                    </button>

                                    <button
                                        onClick={() => onDelete(ev.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        🗑 Sil
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventPage;
