import React, { useState,useEffect } from "react";
import SurveyModal from "../StudentPages/SurveyModal";

interface EventItem {
    id: number;
    Name?: string;
    name?: string;
    Capacity?: number;
    capacity?: number;
    Location?: string;
    location?: string;
    StartDate?: string;
    startDate?: string;
    EndDate?: string;
    endDate?: string;
    ClubName?: string;
    clubName?: string;
    Description?: string;
    description?: string;
    alreadyRated?: boolean;
}

interface PastEventsPageProps {
    pastEvents: EventItem[];
    missedEvents: EventItem[];
    formatDate: (date: string | null | undefined) => string;
}

const PastEventsPage: React.FC<PastEventsPageProps> = ({
    pastEvents,
    missedEvents,
    formatDate
}) => {
    const [activeTab, setActiveTab] = useState<"joinedPast" | "missed">("joinedPast");

const [selectedEvent, setSelectedEvent] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const token = localStorage.getItem("token");
const API_URL = "http://localhost:8080";

    const openSurvey = async (event) => {
        const res = await fetch(`${API_URL}/api/studentpanel/events/${event.id}/rating-status`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.alreadyRated) {
            alert("Bu etkinliği zaten değerlendirmişsiniz.");
            return;
        }

        setSelectedEvent(event);
        setModalOpen(true);
    };

    const submitSurvey = async (ratings) => {
        if (!selectedEvent) return;

        const res = await fetch(`${API_URL}/api/studentpanel/events/${selectedEvent.id}/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(ratings),
        });
    };

    const [refresh, setRefresh] = useState(0);


    useEffect(() => {
        const loadRatingStatus = async () => {
            for (let ev of pastEvents) {
                try {
                    const res = await fetch(
                        `${API_URL}/api/studentpanel/events/${ev.id}/rating-status`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const data = await res.json();
                    ev.alreadyRated = data.alreadyRated;
                } catch (err) {
                    console.error("Rating status error:", err);
                }
            }

            // state’i tetiklemek için yeniden set'le
            setRefresh((prev) => prev + 1);
        };

        loadRatingStatus();
    }, [pastEvents]);




    return (
        <div className="text-white">
            <h1
                className="text-4xl font-bold mb-12 antialiased
  bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
  bg-clip-text text-transparent inline-block"
            >
                Geçmiş Etkinlikler
            </h1>

            {/* SEKME BUTONLARI */}
            <div className="flex gap-4 mb-8">

                <button
                    onClick={() => setActiveTab("joinedPast")}
                    className={`px-6 py-2 rounded-xl font-semibold transition-all 
        ${activeTab === "joinedPast"
                            ? "bg-[#3b82f6] text-white"
                            : "bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a3e]"
                        }`}
                >
                    Katıldığım Geçmiş Etkinlikler
                </button>

                <button
                    onClick={() => setActiveTab("missed")}
                    className={`px-6 py-2 rounded-xl font-semibold transition-all
        ${activeTab === "missed"
                            ? "bg-[#3b82f6] text-white"
                            : "bg-[#1a1a2e] text-gray-300 hover:bg-[#2a2a3e]"
                        }`}
                >
                    Kaçırdığım Etkinlikler
                </button>

            </div>



            {/* KATILDIĞIM GEÇMİŞ ETKİNLİKLER */}
            {activeTab === "joinedPast" && (
                pastEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                            Katıldığınız geçmiş etkinlik bulunmamaktadır.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pastEvents.map(event => (
                            <div
                                key={event.id}
                                className="bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6"
                            >
                                <h3 className="text-xl font-bold text-[#3b82f6] mb-3">
                                    {event.Name || event.name}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300 mb-3">
                                    <div>📍Konum: {event.Location || event.location}</div>
                                    <div>🏛Kulüp İsmi: {event.ClubName || event.clubName}</div>
                                    <div>👥Kontenjan: {event.Capacity || event.capacity}</div>
                                    <div>
                                        📅Tarih: {formatDate(event.StartDate || event.startDate)} —{" "}
                                        {formatDate(event.EndDate || event.endDate)}
                                    </div>
                                </div>

                                {(event.Description || event.description) && (
                                    <p className="text-gray-400 text-sm italic">
                                      📝Açıklama:  "{event.Description || event.description}"
                                    </p>
                                )}

                                {!event.alreadyRated && (
                                    <button
                                        onClick={() => openSurvey(event)}
                                        className="mt-4 px-6 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#315fcc] text-white font-semibold">
                                        ⭐ Etkinliği Değerlendir
                                    </button>
                                )}

                                {event.alreadyRated && (
                                    <p className="mt-4 text-green-400 font-semibold">
                                        ✔ Bu etkinliği değerlendirdiniz
                                    </p>
                                )}


                            </div>
                        ))}
                    </div>
                )
            )}
            {/* KAÇIRDIĞIM ETKİNLİKLER */}
            {activeTab === "missed" && (
                missedEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">
                            Kaçırdığınız etkinlik bulunmamaktadır.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {missedEvents.map(event => (
                            <div
                                key={event.id}
                                className="bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6"
                            >
                                <h3 className="text-xl font-bold text-[#3b82f6] mb-3">
                                    {event.Name || event.name}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300 mb-3">
                                    <div>📍Konum: {event.Location || event.location}</div>
                                    <div>🏛Kulüp İsmi: {event.ClubName || event.clubName}</div>
                                    <div>👥Kontenjan: {event.Capacity || event.capacity}</div>
                                    <div>
                                        📅Tarih: {formatDate(event.StartDate || event.startDate)} —{" "}
                                        {formatDate(event.EndDate || event.endDate)}
                                    </div>
                                </div>

                                {(event.Description || event.description) && (
                                    <p className="text-gray-400 text-sm italic">
                                      📝Açıklama:  "{event.Description || event.description}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}


            {modalOpen && selectedEvent && (
                <SurveyModal
                    eventName={selectedEvent.Name || selectedEvent.name}
                    onClose={() => setModalOpen(false)}
                    onSubmit={submitSurvey}
                />
            )}

        </div>


    );
};

export default PastEventsPage;
