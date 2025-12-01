// ClubEventsPage.tsx
import React from "react";

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
    return (
        <div className="text-white">
            <h1
                className="text-4xl font-bold mb-12 antialiased
  bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
  bg-clip-text text-transparent inline-block"
            >
                Katıldığım Kulüplerin Etkinlikleri
            </h1>

          
            {clubEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Henüz etkinlik bulunmamaktadır.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {clubEvents.map((event) => (
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
                                <div>📍 {event.Location || event.location}</div>
                                <div>🏛 {event.ClubName || event.clubName}</div>
                                <div>👥 Kontenjan: {event.Capacity || event.capacity}</div>
                                <div>
                                    📅 {formatDate(event.StartDate || event.startDate)} —{" "}
                                    {formatDate(event.EndDate || event.endDate)}
                                </div>
                            </div>

                            {(event.Description || event.description) && (
                                <p className="text-gray-400 text-sm italic mb-3">
                                    "{event.Description || event.description}"
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
