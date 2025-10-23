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
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    // 🟢 Etkinlikleri getir
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // 🟢 Kayıt / Güncelleme işlemi
    const handleSaveEvent = async (form: any) => {
        setIsLoading(true);
        const isEdit = !!selectedEvent;
        const url = isEdit
            ? `${API_URL}/api/Events/update/${form.Id}` // ✅ form.Id artık doğru
            : `${API_URL}/api/Events/create`;
        const method = isEdit ? "PUT" : "POST";

        console.log("📡 Gönderilen:", form);

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    Accept: "application/json; charset=utf-8",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            setSuccessMessage(data.message || "İşlem tamamlandı.");
            setShowSuccessModal(true);

            // 2 saniye sonra modal'ı kapat
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);

            await fetchEvents();
            setSelectedEvent(null);
        } catch (error) {
            console.error("Sunucu bağlantı hatası:", error);
            alert("🚫 Sunucuya bağlanılamadı. Backend (8080) çalışıyor mu?");
        } finally {
            setIsLoading(false);
        }
    };

    // 🗑️ Silme işlemi
    const handleDelete = async (id: number) => {
        if (!window.confirm("Etkinliği silmek istiyor musunuz?")) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/Events/delete/${id}`, {
                method: "DELETE",
                headers: { Accept: "application/json; charset=utf-8" },
            });

            const data = await res.json();
            setSuccessMessage(data.message || "🗑️ Etkinlik silindi.");
            setShowSuccessModal(true);

            // 2 saniye sonra modal'ı kapat
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);

            await fetchEvents();
        } catch (error) {
            console.error("Sunucu bağlantı hatası:", error);
            alert("🚫 Sunucuya bağlanılamadı. Backend (8080) çalışıyor mu?");
        } finally {
            setIsLoading(false);
        }
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
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex flex-col items-center py-10 px-4 relative overflow-hidden">
            
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-15 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#1e3a8a] to-[#2d1b69] rounded-full opacity-10 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-8 animate-pulse delay-500"></div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#3b82f6] rounded-full animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-6xl">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-bounce">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                            </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-28 h-28 border-2 border-[#3b82f6] rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                    </div>

                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent animate-pulse">
                        🎉 Uni2Club Etkinlik Paneli
                    </h1>

                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center transform rotate-12">
                                <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <span className="text-3xl font-bold bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                                Uni2Club
                            </span>
                        </div>
                    </div>

                    {/* Etkinlik Sistemi Badge */}
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#1a1a3a] to-[#2a2a4a] border border-[#3b82f6] rounded-full px-4 py-2 mb-4">
                        <svg className="w-5 h-5 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                        </svg>
                        <span className="text-sm text-gray-300">Etkinlik Yönetim Sistemi</span>
                    </div>
                </div>

                {/* Form Section */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300 mb-8">
                    <div className="bg-[#0f0f1a] rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                                {selectedEvent ? "✏️ Etkinliği Düzenle" : "🆕 Yeni Etkinlik Oluştur"}
                            </h2>
                            {selectedEvent && (
                                <button
                                    onClick={handleNewEvent}
                                    className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:from-[#4a2a8a] hover:to-[#4f94f6] text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
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
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                    <div className="bg-[#0f0f1a] rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                            📅 Etkinlik Listesi
                        </h2>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-300">Etkinlikler yükleniyor...</span>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                    </svg>
                                </div>
                                <p className="text-gray-400">Henüz etkinlik oluşturulmadı.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-xl p-6 shadow-lg hover:scale-[1.01] transition-all duration-300 group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-[#3b82f6] mb-3 group-hover:text-[#4f94f6] transition-colors">
                                                    {event.Name}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                                        </svg>
                                                        <span>{event.Location}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                        </svg>
                                                        <span>{event.ClubName}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99L12 11l-1.99-2.01A2.5 2.5 0 0 0 8 8H5.46c-.8 0-1.54.37-2.01.99L1 14.5V22h2v-6h2.5l2.54-7.63A1.5 1.5 0 0 1 9.46 8H12c.8 0 1.54.37 2.01.99L16 11l1.99-2.01A2.5 2.5 0 0 1 20 8h2.5l-2.54 7.63A1.5 1.5 0 0 1 18.54 16H16v6h4z" />
                                                        </svg>
                                                        <span>Kontenjan: {event.Capacity}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                                        </svg>
                                                        <span>
                                                            {event.StartDate.split("T")[0]} — {event.EndDate.split("T")[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 mt-3 text-sm">{event.Description}</p>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-6">
                                                <button
                                                    onClick={() => handleEdit(event)}
                                                    className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:from-[#4a2a8a] hover:to-[#4f94f6] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                                                >
                                                    ✏️ Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] hover:from-[#ff5252] hover:to-[#ff7979] px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                                                >
                                                    🗑️ Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-2xl p-8 mx-4 max-w-md w-full transform animate-bounceIn shadow-2xl">
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            {/* Success Message */}
                            <h3 className="text-2xl font-bold text-white mb-4">
                                İşlem Başarılı!
                            </h3>

                            <p className="text-gray-300 mb-6">
                                {successMessage}
                            </p>

                            {/* Etkinlik Sistemi Info */}
                            <div className="bg-gradient-to-r from-[#0f0f1a] to-[#1a1a2e] border border-[#3b82f6] rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <svg className="w-5 h-5 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-[#3b82f6]">Uni2Club Etkinlik Sistemi</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Etkinlik başarıyla yönetildi! Artık katılımcılar bu etkinliğe kayıt olabilir.
                                </p>
                            </div>

                            {/* Loading Bar */}
                            <div className="w-full bg-[#0f0f1a] rounded-full h-2 mb-4">
                                <div className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] h-2 rounded-full animate-pulse"></div>
                            </div>

                            <p className="text-xs text-gray-500">
                                Yönlendiriliyorsunuz...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventPage; 