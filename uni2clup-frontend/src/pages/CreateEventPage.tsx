import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EventForm from "../components/EventForm";

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

                    // ⬇⬇⬇ SADECE BU 2 SATIRI EKLEDİM (TARİH HATALARI İÇİN) ⬇⬇⬇
                    const safeStart = typeof event.StartDate === "string" ? event.StartDate.slice(0, 16) : "";
                    const safeEnd = typeof event.EndDate === "string" ? event.EndDate.slice(0, 16) : "";
                    // ⬆⬆⬆ EKLENEN YER ⬆⬆⬆

                    setSelectedEvent({
                        id: event.id ?? event.Id,
                        name: event.Name,
                        capacity: event.Capacity,
                        location: event.Location,
                        startDate: safeStart,
                        endDate: safeEnd,
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
        <div className="max-w-5xl mx-auto mt-10 text-white">

            <h1 className="text-4xl font-bold mb-8">
                {editId ? "✏️ Etkinliği Düzenle" : "🆕 Yeni Etkinlik Oluştur"}
            </h1>

            <div className="bg-[#0f0f1a] p-6 rounded-xl border border-[#3b82f6]">
                {loading ? (
                    <p>Yükleniyor...</p>
                ) : (
                    <EventForm
                        onSave={handleSave}
                        selectedEvent={selectedEvent}
                        clearSelected={() => setSelectedEvent(null)}
                    />
                )}
            </div>

        </div>
    );
};

export default CreateEventPage;