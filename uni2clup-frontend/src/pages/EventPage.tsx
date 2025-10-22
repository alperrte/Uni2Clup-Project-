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

const EventPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    // 🟢 Etkinlikleri getir
    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/Events/list`, {
                headers: { Accept: "application/json; charset=utf-8" },
            });
            if (!res.ok) throw new Error("Etkinlikler alınamadı");

            const data = await res.json();

            // 🧩 ID normalize işlemi (Id → id)
            const normalized = data.map((e: any) => ({
                id: e.id ?? e.Id, // 👈 burada büyük "Id" varsa düzelt
                Name: e.Name,
                Capacity: e.Capacity,
                Location: e.Location,
                StartDate: e.StartDate,
                EndDate: e.EndDate,
                ClubName: e.ClubName,
                Description: e.Description,
            }));

            setEvents(normalized);
        } catch {
            alert("🚫 Etkinlikler yüklenemedi, backend açık mı?");
        }
    }, [API_URL]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // 🟢 Kayıt / Güncelleme işlemi
    const handleSaveEvent = async (form: any) => {
        const isEdit = !!selectedEvent;
        const url = isEdit
            ? `${API_URL}/api/Events/update/${form.Id}` // ✅ form.Id artık doğru
            : `${API_URL}/api/Events/create`;
        const method = isEdit ? "PUT" : "POST";

        console.log("📡 Gönderilen:", form);

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                Accept: "application/json; charset=utf-8",
            },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        alert(data.message || "İşlem tamamlandı.");

        await fetchEvents();
        setSelectedEvent(null);
    };

    // 🗑️ Silme işlemi
    const handleDelete = async (id: number) => {
        if (!window.confirm("Etkinliği silmek istiyor musunuz?")) return;

        const res = await fetch(`${API_URL}/api/Events/delete/${id}`, {
            method: "DELETE",
            headers: { Accept: "application/json; charset=utf-8" },
        });

        const data = await res.json();
        alert(data.message || "🗑️ Etkinlik silindi.");

        await fetchEvents();
    };

    // ✏️ Düzenleme moduna geç
    const handleEdit = (event: Event) => {
        setSelectedEvent({
            ...event,
            StartDate: event.StartDate.slice(0, 16),
            EndDate: event.EndDate.slice(0, 16),
        });
    };

    const handleNewEvent = () => {
        setSelectedEvent(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex flex-col items-center py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">🎉 Uni2Clup Etkinlik Paneli</h1>

            <div className="flex justify-between items-center w-full max-w-2xl mb-4">
                <h2 className="text-xl font-semibold">
                    {selectedEvent ? "✏️ Etkinliği Düzenle" : "🆕 Yeni Etkinlik Oluştur"}
                </h2>
                {selectedEvent && (
                    <button
                        onClick={handleNewEvent}
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-white text-sm font-medium transition"
                    >
                        ➕ Yeni Etkinlik
                    </button>
                )}
            </div>

            {/* 🧩 EventForm bileşeni */}
            <EventForm
                onSave={handleSaveEvent}
                selectedEvent={
                    selectedEvent
                        ? {
                            id: selectedEvent.id,
                            name: selectedEvent.Name,
                            capacity: selectedEvent.Capacity,
                            location: selectedEvent.Location,
                            startDate: selectedEvent.StartDate,
                            endDate: selectedEvent.EndDate,
                            clubName: selectedEvent.ClubName,
                            description: selectedEvent.Description,
                        }
                        : null
                }
                clearSelected={() => setSelectedEvent(null)}
            />

            <div className="w-full max-w-4xl mt-10">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    📅 Etkinlik Listesi
                </h2>

                {events.length === 0 ? (
                    <p>Henüz etkinlik oluşturulmadı.</p>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id} // ✅ Benzersiz key
                            className="bg-white/10 border border-white/20 p-5 rounded-2xl mb-4 shadow-lg hover:scale-[1.01] transition-all"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-yellow-300 mb-1">
                                        {event.Name}
                                    </h3>
                                    <div className="text-sm text-gray-200 space-y-1">
                                        <p>📍 {event.Location}</p>
                                        <p>🏫 {event.ClubName}</p>
                                        <p>👥 Kontenjan: {event.Capacity}</p>
                                        <p>
                                            🕓 {event.StartDate.split("T")[0]} —{" "}
                                            {event.EndDate.split("T")[0]}
                                        </p>
                                        <p>📝 {event.Description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="bg-[#0d1b45] hover:bg-[#142b6b] px-4 py-2 rounded-lg font-semibold text-yellow-400 transition"
                                    >
                                        ✏️ Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="bg-[#ffd700] hover:bg-[#ffca28] px-4 py-2 rounded-lg font-semibold text-[#0d1b45] transition"
                                    >
                                        🗑️ Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventPage;
