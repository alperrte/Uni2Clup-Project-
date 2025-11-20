import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ClubManagerLayout from "../components/ClubManagerLayout";

// Sayfalar
import EventPage from "./EventPage";
import CreateEventPage from "./CreateEventPage";
import AnnouncementsPage from "./AnnouncementsPage";   // ⭐ Buraya import ediyoruz

const MembersPage = () => (
    <div className="text-white text-3xl">Kulüp Üyeleri Sayfası</div>
);

const SettingsPage = () => (
    <div className="text-white text-3xl">Ayarlar Sayfası</div>
);

interface Props {
    handleLogout: () => void;
}

const ClubManagerRoutes: React.FC<Props> = ({ handleLogout }) => {
    return (
        <ClubManagerLayout handleLogout={handleLogout}>
            <Routes>

                {/* Varsayılan yönlendirme */}
                <Route index element={<Navigate to="/club/create-event" replace />} />

                {/* Etkinlik oluştur */}
                <Route path="create-event" element={<CreateEventPage />} />

                {/* Etkinlik listesi */}
                <Route path="events" element={<EventPage />} />

                {/* ⭐ Duyurular Sayfası */}
                <Route path="announcements" element={<AnnouncementsPage />} />

                {/* Kulüp üyeleri */}
                <Route path="members" element={<MembersPage />} />

                {/* Ayarlar */}
                <Route path="settings" element={<SettingsPage />} />

                {/* Yanlış URL → create-event */}
                <Route path="*" element={<Navigate to="/club/create-event" replace />} />

            </Routes>
        </ClubManagerLayout>
    );
};

export default ClubManagerRoutes;