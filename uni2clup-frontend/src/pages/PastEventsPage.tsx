// PastEventsPage.tsx
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
}

interface PastEventsPageProps {
    pastEvents: EventItem[];
    formatDate: (date: string | null | undefined) => string;
}

const PastEventsPage: React.FC<PastEventsPageProps> = ({
    pastEvents,
    formatDate
}) => {
    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Geçmiş Etkinliklerim</h1>
            <p className="text-gray-400 mb-8">Tarihi dolmuş etkinlikler</p>

            {pastEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Henüz geçmiş etkinlik bulunmamaktadır.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pastEvents.map((event) => (
                        <div
                            key={event.id}
                            className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e]
                                       border border-[#3b82f6]/50 rounded-xl p-6 shadow-xl opacity-95"
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
                                <p className="text-gray-400 text-sm italic">
                                    "{event.Description || event.description}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PastEventsPage;
