import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EventForm from "../components/EventForm";

const TURKEY_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

const formatDateForTurkeyInput = (value?: string | Date | null) => {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (isNaN(date?.getTime() ?? NaN)) return "";

    const parts = TURKEY_DATE_FORMATTER.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
        if (part.type !== "literal") acc[part.type] = part.value;
        return acc;
    }, {});

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

const CreateEventPage: React.FC = () => {
    const API_URL = "http://localhost:8080";
    const token = localStorage.getItem("token");

    const location = useLocation();
    const navigate = useNavigate();

    // URL'den id oku → ?id=5
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get("id");

    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // ⭐ Düzenleme modundaysa → etkinlik bilgilerini backend'den çek
    useEffect(() => {
        if (!editId) return;

        const fetchEvent = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/Events/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const data = await res.json();

                const event = data.find((e: any) => e.id == editId || e.Id == editId);

                if (event) {

                    setSelectedEvent({
                        id: event.id ?? event.Id,
                        name: event.Name,
                        capacity: event.Capacity,
                        location: event.Location,
                        startDate: formatDateForTurkeyInput(event.StartDate),
                        endDate: formatDateForTurkeyInput(event.EndDate),
                        clubName: event.ClubName,
                        description: event.Description
                    });
                }

            } catch (err) {
                console.error("Etkinlik bilgisi alınamadı:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [editId, token]);

    // ⭐ KAYDET → Yeni oluşturma veya güncelleme
    const handleSave = async (formData: any) => {
        try {
            let url = "";
            let method = "";

            if (editId) {
                url = `${API_URL}/api/Events/update/${editId}`;
                method = "PUT";
            } else {
                url = `${API_URL}/api/Events/create`;
                method = "POST";
            }

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            alert(data.message || "İşlem başarılı.");

            navigate("/club/events");

        } catch (error) {
            console.error("Etkinlik kaydetme hatası:", error);
            alert("Hata oluştu.");
        }
    };

    return (
        <div className="relative text-white">
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900"></div>

            <div className="max-w-6xl mx-auto py-10 space-y-10">
                <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] border border-[#3b82f6]/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-y-0 right-0 w-1/3 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_70%)]" />
                    <p className="uppercase tracking-[0.35em] text-sm text-[#93c5fd] mb-3">
                        {editId ? "ETKİNLİK GÜNCELLEME" : "ETKİNLİK PLANLAMA"}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-extrabold">
                                {editId ? "Etkinliği Düzenle" : "Yeni Etkinlik Oluştur"}
                            </h1>
                            <p className="text-gray-300 mt-3 max-w-2xl">
                                Kulüp üyeleriniz için yeni bir etkinlik oluşturun.
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-[#0f0f1a]/80 border border-[#3b82f6]/30 rounded-3xl p-10 shadow-2xl text-center">
                        <p className="text-lg text-gray-300">Etkinlik bilgileri yükleniyor...</p>
                    </div>
                ) : (
                    <div className="bg-[#0f0f1a]/90 border border-[#3b82f6]/40 rounded-3xl p-8 shadow-2xl">
                        <EventForm
                            onSave={handleSave}
                            selectedEvent={selectedEvent}
                            clearSelected={() => setSelectedEvent(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateEventPage;