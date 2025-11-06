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
    CreatedBy?: string;
}

const EventPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const API_URL = "http://localhost:8080";
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");

    // ✅ Erişim kontrolü
    useEffect(() => {
        if (userRole === "Admin") {
            alert("🚫 Admin bu sayfaya erişemez. Lütfen kullanıcı sayfasına gidin.");
            window.location.href = "/add-user";
        } else if (!token || userRole !== "ClubManager") {
            alert("🔒 Yetkisiz erişim. Lütfen ClubManager olarak giriş yapın.");
            localStorage.clear();
            window.location.reload();
        }
    }, [userRole, token]);

    // ✅ Tarih biçimlendirici
    const formatDate = (date: string | null | undefined) => {
        if (!date) return "Tarih Yok";
        const d = new Date(date);
        return d.toLocaleString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // ✅ Token kontrolü
    const checkTokenValidity = useCallback(() => {
        if (!token) {
            alert("🔒 Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            window.location.reload();
            return false;
        }
        return true;
    }, [token]);

    // ✅ Etkinlikleri getir
    const fetchEvents = useCallback(async () => {
        if (!checkTokenValidity()) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/Events/list`, {
                headers: {
                    Accept: "application/json; charset=utf-8",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                alert("🔒 Oturum süresi doldu. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            if (!res.ok) throw new Error("Etkinlikler alınamadı");
            const data = await res.json();

            const normalized = data.map((e: any) => ({
                id: e.id ?? e.Id,
                Name: e.Name ?? e.name,
                Capacity: e.Capacity ?? e.capacity,
                Location: e.Location ?? e.location,
                StartDate: e.StartDate ?? e.startDate,
                EndDate: e.EndDate ?? e.endDate,
                ClubName: e.ClubName ?? e.clubName,
                Description: e.Description ?? e.description,
                CreatedBy: e.CreatedBy ?? e.createdBy,
            }));

            setEvents(normalized);
        } catch (error) {
            console.error("🚫 Etkinlikler yüklenemedi:", error);
            alert("🚫 Etkinlikler yüklenemedi, backend açık mı?");
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, token, checkTokenValidity]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // ✅ Kayıt / Güncelleme işlemi
    const handleSaveEvent = async (form: any) => {
        if (!checkTokenValidity()) return;
        setIsLoading(true);
        const isEdit = !!selectedEvent;
        const url = isEdit
            ? `${API_URL}/api/Events/update/${form.Id ?? form.id}`
            : `${API_URL}/api/Events/create`;
        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    Accept: "application/json; charset=utf-8",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.status === 401) {
                alert("🔒 Oturum süresi doldu. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            const data = await res.json();
            setSuccessMessage(data.message || "İşlem tamamlandı.");
            setShowSuccessModal(true);

            setTimeout(() => setShowSuccessModal(false), 2000);

            await fetchEvents();
            setSelectedEvent(null);
        } catch (error) {
            console.error("🚫 Sunucu bağlantı hatası:", error);
            alert("🚫 Backend (8080) bağlantısı başarısız.");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Silme işlemi
    const handleDelete = async (id: number) => {
        if (!checkTokenValidity()) return;
        const event = events.find(e => e.id === id);
        if (!event) return;
        if (!window.confirm("Etkinliği silmek istiyor musunuz?")) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/Events/delete/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json; charset=utf-8",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                alert("🔒 Oturum süresi doldu. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            const data = await res.json();
            setSuccessMessage(data.message || "🗑️ Etkinlik silindi.");
            setShowSuccessModal(true);

            setTimeout(() => setShowSuccessModal(false), 2000);
            await fetchEvents();
        } catch (error) {
            console.error("🚫 Silme hatası:", error);
            alert("🚫 Backend (8080) bağlantısı başarısız.");
        } finally {
            setIsLoading(false);
        }
    };

    // ✏️ Düzenleme
    const handleEdit = (event: Event) => {
        setSelectedEvent({
            ...event,
            StartDate: event.StartDate ? event.StartDate.slice(0, 16) : "",
            EndDate: event.EndDate ? event.EndDate.slice(0, 16) : "",
        });
    };

    const handleNewEvent = () => setSelectedEvent(null);

    const handleLogout = () => {
        if (window.confirm("Oturumu kapatmak istiyor musunuz?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex flex-col items-center py-10 px-4 relative overflow-hidden">

            {/* 🚪 Çıkış Yap Butonu */}
            <button
                onClick={handleLogout}
                className="absolute top-6 right-8 z-50 bg-indigo-700 hover:bg-indigo-900 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300"
            >
               ➜] Çıkış Yap
            </button>

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
                {/* Header */}
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
                        🎉 Uni2Clup Etkinlik Paneli
                    </h1>
                </div>

                {/* Event Form */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300 mb-8">
                    <div className="bg-[#0f0f1a] rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                                {selectedEvent ? "✏️ Etkinliği Düzenle" : "🆕 Yeni Etkinlik Oluştur"}
                            </h2>
                            {selectedEvent && (
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:from-[#4a2a8a] hover:to-[#4f94f6] text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                                >
                                    ➕ Yeni Etkinlik
                                </button>
                            )}
                        </div>

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

                {/* Event List */}
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
                                                    {event.Name || "Etkinlik Adı Yok"}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                                                    <div className="flex items-center space-x-2">
                                                        <span>📍 {event.Location || "Belirtilmemiş"}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span>🏛 {event.ClubName || "Belirtilmemiş"}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span>👥 Kontenjan: {event.Capacity || "Belirtilmemiş"}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span>📅 {formatDate(event.StartDate)} — {formatDate(event.EndDate)}</span>
                                                    </div>
                                                </div>
                                                {event.Description && (
                                                    <p className="text-gray-400 mt-3 text-sm italic">“{event.Description}”</p>
                                                )}
                                                <p className="text-gray-500 text-xs mt-1">
                                                    👤 Oluşturan: {event.CreatedBy || "Bilinmiyor"}
                                                </p>
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

            {/* ✅ Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-2xl p-8 mx-4 max-w-md w-full transform animate-bounceIn shadow-2xl">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">İşlem Başarılı!</h3>
                            <p className="text-gray-300 mb-6">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventPage;
