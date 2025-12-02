import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ClubManagerLayout from "../../components/ClubManagerLayout";
import EventPage from "./EventPage";
import CreateEventPage from "./CreateEventPage";
import AnnouncementsPage from "./AnnouncementsPage";
import AnnouncementsListPage from "./AnnouncementsListPage";
import MembersPage from "./MembersPage";
import ClubSettingsPage from "./ClubSettingsPage";

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

                {/* ⭐ Duyuru Oluştur */}
                <Route path="announcements" element={<AnnouncementsPage />} />

                {/* ⭐ Duyuru Listesi */}
                <Route path="announcements-list" element={<AnnouncementsListPage />} />

                {/* Kulüp üyeleri */}
                <Route path="members" element={<MembersPage />} />

                {/* Ayarlar */}
                <Route path="settings" element={<ClubSettingsPage />} />

                {/* Yanlış URL → create-event */}
                <Route path="*" element={<Navigate to="/club/create-event" replace />} />

            </Routes>
        </ClubManagerLayout>
    );
};

export default ClubManagerRoutes;