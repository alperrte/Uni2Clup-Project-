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
    isCancelled?: boolean;

}

interface JoinedEventsPageProps {
    myEvents: EventItem[];
    formatDate: (date: string | null | undefined) => string;
    handleLeaveEventStarter: (eventId: number, eventName: string) => void;
    getEventStatus: (start: string, end: string) => { label: string; color: string } | null;

}

const JoinedEventsPage: React.FC<JoinedEventsPageProps> = ({
    myEvents,
    formatDate,
    handleLeaveEventStarter,
    getEventStatus
}) => {

    const [filterType, setFilterType] = useState("all");
    const [showFilterMenu, setShowFilterMenu] = useState(false);


    const filteredEvents = myEvents
        .filter(ev => !ev.isCancelled)
        .filter(ev => {
            const start = new Date(ev.StartDate || ev.startDate);
            const end = new Date(ev.EndDate || ev.endDate);
            const status = getEventStatus(start.toString(), end.toString());

            if (filterType === "active") return status?.label === "Devam Ediyor";
            if (filterType === "upcoming") return status?.label === "Yaklaşıyor";

            return true; 
        })
        .sort((a, b) => {
            const sA = getEventStatus(a.StartDate || a.startDate, a.EndDate || a.endDate);
            const sB = getEventStatus(b.StartDate || b.startDate, b.EndDate || b.endDate);

            const order = { "Devam Ediyor": 1, "Yaklaşıyor": 2, null: 3 };
            return order[sA?.label ?? null] - order[sB?.label ?? null];
        });


    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    

 
    const activeEvents = myEvents.filter(event => {
        const end = new Date(event.EndDate || event.endDate || "");
        return end > currentTime; 
    });



    return (
        <div className="text-white">
            <div className="flex items-center justify-between mb-8">
            <h1
                className="text-4xl font-bold mb-12 antialiased
  bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
  bg-clip-text text-transparent inline-block"
            >
                Katıldığım Etkinlikler
            </h1>

            <div className="relative">
                <button
                    onClick={() => setShowFilterMenu(prev => !prev)}
                    className="px-5 py-2 rounded-xl shadow-md font-semibold flex items-center gap-2
                   bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:opacity-90 transition"
                >
                    {filterType === "all" && "Tümü"}
                    {filterType === "active" && "Devam Ediyor"}
                    {filterType === "upcoming" && "Yaklaşıyor"}

                    <svg
                        className={`w-4 h-4 transform transition-transform ${showFilterMenu ? "rotate-180" : ""}`}
                        fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"
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


            {activeEvents.length === 0 ? (

                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Henüz katıldığınız etkinlik bulunmamaktadır.
                    </p>
                </div>
            ) : (
                    <div className="space-y-4">
                        {filteredEvents.filter(ev => new Date(ev.EndDate || ev.endDate) > currentTime).map((event) => (

                            <div
                                key={event.id}
                                className="relative bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6"
                            >

                                {/* ETİKET*/}
                                {(() => {
                                    const status = getEventStatus(event.StartDate || event.startDate, event.EndDate || event.endDate);
                                    return status ? (
                                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm text-white ${status.color}`}>
                                            {status.label}
                                        </span>
                                    ) : null;
                                })()}

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
