import React, { useState, useEffect } from "react";
import EventForm from "../components/EventForm";

interface Event {
    id: number;
    name: string;
    capacity: number;
    location: string;
    startDate: string;
    endDate: string;
    clubName: string;
    description: string;
}

const EventPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    // 🎯 Etkinlikleri getir
    useEffect(() => {
        fetch(`${API_URL}/api/Events/list`, {
            headers: { Accept: "application/json" },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Etkinlikler alınamadı");
                return res.json();
            })
            .then((data) => setEvents(data))
            .catch(() => alert("🚫 Etkinlikler yüklenemedi, backend açık mı?"));
    }, [API_URL]);

    // 💾 Kaydet veya güncelle
    const handleSaveEvent = async (form: Omit<Event, "id">) => {
        const url = selectedEvent
            ? `${API_URL}/api/Events/update/${selectedEvent.id}`
            : `${API_URL}/api/Events/create`;
        const method = selectedEvent ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(form),
        });

        const text = await res.text();
        let message = "İşlem tamamlandı.";

        if (text) {
            try {
                const data = JSON.parse(text);
                message = data.message || message;
            } catch {
                message = text;
            }
        }

        alert(message);

        // 🔁 Listeyi yenile
        const updated = await fetch(`${API_URL}/api/Events/list`, {
            headers: { Accept: "application/json" },
        }).then((r) => r.json());
        setEvents(updated);
        setSelectedEvent(null);
    };

    // ❌ Sil
    const handleDelete = async (id: number) => {
        if (!window.confirm("Etkinliği silmek istiyor musunuz?")) return;
        const res = await fetch(`${API_URL}/api/Events/delete/${id}`, { method: "DELETE" });
        const data = await res.json();
        alert(data.message);
        setEvents(events.filter((ev) => ev.id !== id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex flex-col items-center py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">🎉 Uni2Clup Etkinlik Paneli</h1>

            <EventForm
                onSave={handleSaveEvent}
                selectedEvent={selectedEvent}
                clearSelected={() => setSelectedEvent(null)}
            />

            <div className="w-full max-w-3xl mt-10">
                <h2 className="text-xl font-semibold mb-4">📅 Etkinlik Listesi</h2>

                {events.length === 0 ? (
                    <p>Henüz etkinlik oluşturulmadı.</p>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white/10 border border-white/20 p-4 rounded-xl flex justify-between items-center"
                        >
                            <div>
                                <h3 className="text-lg font-bold">
                                    {event.name || "İsimsiz Etkinlik"}
                                </h3>
                                <p className="text-sm text-gray-300">
                                    {event.location || "Konum Yok"} —{" "}
                                    {event.startDate
                                        ? event.startDate.split("T")[0]
                                        : "Tarih Yok"}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedEvent(event)}
                                    className="bg-yellow-500 px-3 py-1 rounded text-sm"
                                >
                                    Düzenle
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="bg-red-500 px-3 py-1 rounded text-sm"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventPage;
