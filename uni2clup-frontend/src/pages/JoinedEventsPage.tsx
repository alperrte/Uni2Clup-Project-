// JoinedEventsPage.tsx
import React, { useEffect, useState } from "react";


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
}

interface JoinedEventsPageProps {
    myEvents: EventItem[];
    formatDate: (date: string | null | undefined) => string;
    handleLeaveEventStarter: (eventId: number, eventName: string) => void;
}

const JoinedEventsPage: React.FC<JoinedEventsPageProps> = ({
    myEvents,
    formatDate,
    handleLeaveEventStarter
}) => {

    // ⏰ Sayfayı yenilemeden otomatik güncelleme için canlı zaman
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // her 1 saniyede bir kontrol

        return () => clearInterval(timer);
    }, []);


    

    // ⛔ Bitiş tarihi geçmiş etkinlikleri listeden çıkar
    const activeEvents = myEvents.filter(event => {
        const end = new Date(event.EndDate || event.endDate || "");
        return end > currentTime; // ⬅ canlı zaman ile karşılaştır
    });



    return (
        <div className="text-white">
            <h1
                className="text-4xl font-bold mb-12 antialiased
  bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
  bg-clip-text text-transparent inline-block"
            >
                Katıldığım Etkinlikler
            </h1>

            

            {activeEvents.length === 0 ? (

                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Henüz katıldığınız etkinlik bulunmamaktadır.
                    </p>
                </div>
            ) : (
                    <div className="space-y-4">
                        {activeEvents.map((event) => (
                            <div
                                key={event.id}
                                className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e]
                       border border-[#3b82f6]/50 rounded-xl p-6 shadow-xl
                       hover:scale-[1.01] transition-all duration-300"
                            >

                            <h3 className="text-xl font-bold text-[#3b82f6] mb-3">
                                {event.Name || event.name}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300 mb-3">
                                <div>📍Konum: {event.Location || event.location}</div>
                                <div>🏛 Kulüp İsmi: {event.ClubName || event.clubName}</div>
                                <div>👥 Kontenjan: {event.Capacity || event.capacity}</div>
                                <div>
                                    📅 Tarih: {formatDate(event.StartDate || event.startDate)} —{" "}
                                    {formatDate(event.EndDate || event.endDate)}
                                </div>
                            </div>

                            {(event.Description || event.description) && (
                                <p className="text-gray-400 text-sm italic">
                                   📝 Açıklama: "{event.Description || event.description}"
                                </p>
                            )}
                            <button
                                onClick={() =>
                                    handleLeaveEventStarter(event.id, event.Name || event.name)
                                }
                                className="mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 
               text-white text-sm transition-all"
                            >
                                Etkinlikten Ayrıl
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JoinedEventsPage;
