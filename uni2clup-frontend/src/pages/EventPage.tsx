import React, { useState, useEffect, useCallback } from "react";
import EventForm from "../components/EventForm";

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

const TURKEY_TIME_ZONE = "Europe/Istanbul";
const displayFormatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: TURKEY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
});

const inputFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TURKEY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

const parseEventDate = (value: string) => {
    if (!value) return null;
    const hasTimezone = /Z|[+-]\d{2}:\d{2}$/i.test(value);
    const normalized = hasTimezone ? value : `${value}Z`;
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
};

const formatForDisplay = (value: string) => {
    const date = parseEventDate(value);
    if (!date) return value;
    return displayFormatter.format(date);
};

const formatForInput = (value: string) => {
    if (!value) return "";
    const date = parseEventDate(value);
    if (!date) return "";
    const parts = inputFormatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
        if (part.type !== "literal") acc[part.type] = part.value;
        return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

const EventPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filter, setFilter] = useState("Tümü");
    const [open, setOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_URL = "http://localhost:8080";
    const token = localStorage.getItem("token");

    const getStatus = (start: string, end: string) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);

        if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Tarih Hatalı";
        if (now < s) return "Yaklaşıyor";
        if (now > e) return "Bitti";
        return "Devam Ediyor";
    };

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/events/list`, {
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
        setEditingEvent({
            id: ev.id,
            name: ev.Name,
            capacity: ev.Capacity.toString(),
            location: ev.Location,
            startDate: formatForInput(ev.StartDate),
            endDate: formatForInput(ev.EndDate),
            clubName: ev.ClubName,
            description: ev.Description,
        });
        setIsModalOpen(true);
    };

    const handleUpdate = async (formData: any) => {
        const targetId = formData.Id || editingEvent?.id;
        if (!targetId) return;

        try {
            const res = await fetch(`${API_URL}/api/Events/update/${targetId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            alert(data.message || "Etkinlik güncellendi.");

            setIsModalOpen(false);
            setEditingEvent(null);
            fetchEvents();
        } catch (error) {
            console.error("Etkinlik güncelleme hatası:", error);
            alert("Etkinlik güncellenemedi.");
        }
    };

    const filtered = events.filter(ev => {
        const status = getStatus(ev.StartDate, ev.EndDate);
        if (filter === "Tümü") return true;
        return filter === status;
    });

    return (
        <>
        <div className="relative">
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900"></div>
            <div className="max-w-6xl mx-auto py-10 space-y-8 text-white">
                <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] border border-[#3b82f6]/30 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.4em] text-[#93c5fd] mb-2">Kulüp Etkinlikleri</p>
                        <h1 className="text-4xl font-extrabold">Etkinlik Paneli</h1>
                        <p className="text-gray-300 mt-2 max-w-xl">
                                Kulübünüzün yaklaşan ve devam eden etkinliklerini burada görüntüleyebilir, düzenleyebilir veya silebilirsiniz.
                        </p>
                    </div>
                        <div className="relative z-50">
                        <button
                            onClick={() => setOpen(!open)}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] shadow-lg flex items-center gap-2"
                        >
                            {filter}
                            <span className="text-sm opacity-80">⌄</span>
                        </button>
                        {open && (
                            <div className="absolute right-0 mt-3 w-48 bg-[#0f0f1a] border border-[#3b82f6]/40 rounded-2xl shadow-2xl overflow-hidden">
                                {["Tümü", "Devam Ediyor", "Yaklaşıyor", "Bitti"].map(item => (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            setFilter(item);
                                            setOpen(false);
                                        }}
                                        className={`block w-full text-left px-5 py-3 text-sm transition ${filter === item ? "bg-[#1d2760] text-white" : "text-gray-300 hover:bg-[#111a3b]"}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="bg-[#0f0f1a]/80 border border-[#3b82f6]/20 rounded-3xl p-12 text-center text-gray-300">
                        Etkinlikler yükleniyor...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-[#0f0f1a]/80 border border-[#3b82f6]/20 rounded-3xl p-12 text-center text-gray-300">
                        Gösterilecek etkinlik bulunamadı.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filtered.map(ev => {
                            const status = getStatus(ev.StartDate, ev.EndDate);
                            const color =
                                status === "Devam Ediyor" ? "from-green-500/70 to-green-700/40"
                                    : status === "Yaklaşıyor" ? "from-yellow-500/70 to-yellow-700/40"
                                        : "from-red-500/70 to-red-700/40";

                            return (
                                <div
                                    key={ev.id}
                                    className="relative overflow-hidden rounded-3xl border border-[#3b82f6]/20 bg-[#0f0f1a]/80 shadow-xl p-6"
                                >
                                    <div className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm bg-gradient-to-r ${color}`}>
                                        {status}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-2xl font-bold text-[#93c5fd]">{ev.Name}</h3>
                                        <p className="text-gray-300 flex items-center gap-2">
                                            <span className="text-lg">📍</span>
                                            {ev.Location}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                <p className="text-xs uppercase tracking-wider text-gray-400">Kontenjan</p>
                                                <p className="text-lg font-semibold text-white">{ev.Capacity} kişi</p>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                <p className="text-xs uppercase tracking-wider text-gray-400">Kulüp</p>
                                                <p className="text-lg font-semibold text-white">{ev.ClubName}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                <p className="text-xs uppercase tracking-wider text-gray-400">Tarih</p>
                                                <p className="text-lg font-semibold text-white">
                                                    {formatForDisplay(ev.StartDate)} <span className="opacity-60">→</span> {formatForDisplay(ev.EndDate)}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 italic">“{ev.Description}”</p>

                                        <div className="flex flex-wrap gap-3 mt-4">
                                            <button
                                                onClick={() => onEdit(ev)}
                                                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold shadow-lg hover:scale-[1.02] transition"
                                            >
                                                ✏️ Düzenle
                                            </button>
                                            <button
                                                onClick={() => onDelete(ev.id)}
                                                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow-lg hover:scale-[1.02] transition"
                                            >
                                                🗑 Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

        {isModalOpen && editingEvent && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-[#0f0f1a] border border-[#3b82f6] rounded-2xl w-full max-w-3xl p-6 relative">
                    <button
                        onClick={() => { setIsModalOpen(false); setEditingEvent(null); }}
                        className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-4">Etkinliği Düzenle</h2>
                    <EventForm
                        onSave={handleUpdate}
                        selectedEvent={editingEvent}
                        clearSelected={() => { setEditingEvent(null); setIsModalOpen(false); }}
                    />
                </div>
            </div>
        )}
        </>
    );
};

export default EventPage;
