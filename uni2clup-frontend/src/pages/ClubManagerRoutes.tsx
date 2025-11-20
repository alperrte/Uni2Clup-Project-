import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ClubManagerLayout from "../components/ClubManagerLayout";

// Sayfalar
import EventPage from "./EventPage";
import CreateEventPage from "./CreateEventPage";
import AnnouncementsPage from "./AnnouncementsPage";   // ⭐ Buraya import ediyoruz
import AnnouncementsListPage from "./AnnouncementsListPage";
import ClubSettingsPage from "./ClubSettingsPage";

const MembersPage = () => (
    <div className="relative text-white">
        <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"></div>
        <div className="max-w-5xl mx-auto py-10 space-y-6">
            <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] border border-[#3b82f6]/30 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-4xl font-extrabold mb-3">Kulüp Üyeleri</h1>
                <p className="text-gray-300">
                    Üye yönetimi modülü çok yakında burada olacak. Şimdilik üyelerinizi admin paneli üzerinden yönetebilirsiniz.
                </p>
            </div>
            <div className="bg-[#0f0f1a]/90 border border-[#3b82f6]/40 rounded-3xl p-8 shadow-2xl text-gray-300 text-center">
                Üye listesi henüz entegre edilmedi.
            </div>
        </div>
    </div>
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