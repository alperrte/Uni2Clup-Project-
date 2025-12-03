// ClubEventsPage.tsx
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
    isJoined?: boolean;
}

interface ClubEventsPageProps {
    clubEvents: EventItem[];
    handleJoinEvent: (id: number) => void;
    formatDate: (date: string | null | undefined) => string;
}

const ClubEventsPage: React.FC<ClubEventsPageProps> = ({
    clubEvents,
    handleJoinEvent,
    formatDate
}) => {

    const [filterType, setFilterType] = useState("all");
    // 🔵 Filtre menüsü için gerekli state
    const [showFilterMenu, setShowFilterMenu] = useState(false);


    // ⏰ Sayfayı yenilemeden canlı zaman takibi
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // her saniye kontrol

        return () => clearInterval(timer);
    }, []);


    

    
    const now = new Date();

    const filteredEvents = clubEvents.filter(ev => {
        const start = new Date(ev.startDate || ev.StartDate);
        const end = new Date(ev.endDate || ev.EndDate);

        // Devam Eden Etkinlikler
        if (filterType === "active") {
            return start <= now && end >= now;
        }

        // Yaklaşan Etkinlikler
        if (filterType === "upcoming") {
            return start > now;
        }

        return true; // Tümü
    });


    return (
        <div className="text-white">
           

            <div className="flex items-center justify-between mb-12">
                <h1
                    className="text-4xl font-bold antialiased
        bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
        bg-clip-text text-transparent"
                >
                    Katıldığım Kulüplerin Etkinlikleri
                </h1>

                {/* Filtre Açılır Menü Butonu */}
                <div className="relative">
                    <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="px-5 py-2 rounded-xl shadow-md font-semibold flex items-center gap-2
               bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:opacity-90 transition"
                    >
                        {filterType === "all" && "Tümü"}
                        {filterType === "active" && "Devam Ediyor"}
                        {filterType === "upcoming" && "Yaklaşıyor"}

                        <svg
                            className={`w-4 h-4 transform transition-transform ${showFilterMenu ? "rotate-180" : "rotate-0"
                                }`}
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                        </svg>
                    </button>



                    {showFilterMenu && (
                        <div className="absolute right-0 mt-2 bg-[#0f0f2a] border border-[#3b82f6]/40 
                rounded-xl shadow-xl w-48 p-3 space-y-3 z-50">

                            <button
                                onClick={() => { setFilterType("all"); setShowFilterMenu(false); }}
                                className="flex items-center gap-2 text-white hover:text-blue-400"
                            >
                                🔵 Tümü
                            </button>

                            <button
                                onClick={() => { setFilterType("active"); setShowFilterMenu(false); }}
                                className="flex items-center gap-2 text-green-400 hover:text-green-500"
                            >
                                🟢 Devam Ediyor
                            </button>

                            <button
                                onClick={() => { setFilterType("upcoming"); setShowFilterMenu(false); }}
                                className="flex items-center gap-2 text-yellow-300 hover:text-yellow-400"
                            >
                                🟡 Yaklaşıyor
                            </button>

                        </div>
                    )}
                </div>
            </div>

          
            {filteredEvents.length === 0 ? (


                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Henüz etkinlik bulunmamaktadır.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                        {filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e]
                                       border border-[#3b82f6]/60 rounded-xl p-6 shadow-xl
                                       hover:scale-[1.01] transition-all duration-300"
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
                                <p className="text-gray-400 text-sm italic mb-3">
                                  📝Açıklama:  "{event.Description || event.description}"
                                </p>
                            )}

                            {!event.isJoined && (
                                <button
                                    onClick={() => handleJoinEvent(event.id)}
                                    className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
                                               hover:from-[#4a2a8a] hover:to-[#4f94f6]
                                               px-4 py-2 rounded-lg font-semibold text-white
                                               transition-all duration-300 transform hover:scale-105"
                                >
                                    Etkinliğe Katıl
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClubEventsPage;
