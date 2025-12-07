import React, { useEffect, useState, useCallback } from "react";

const API_URL = "http://localhost:8080";
const TURKEY_TIMEZONE = "Europe/Istanbul";

const formatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: TURKEY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
});

const parseDate = (value: string) => {
    if (!value) return null;
    const hasTimezone = /Z|[+-]\d{2}:\d{2}$/i.test(value);
    const normalized = hasTimezone ? value : `${value}Z`;
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: string) => {
    const date = parseDate(value);
    if (!date) return value;
    return formatter.format(date);
};

interface Announcement {
    id: number;
    message: string;
    createdAt: string;
    eventName: string;
}

const AnnouncementsListPage: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setToken(localStorage.getItem("token"));
    }, []);

    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_URL}/api/announcements/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Duyurular alınamadı.");
            }

            const data = await res.json();
            setAnnouncements(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Duyurular alınamadı.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        fetchAnnouncements();
    }, [token, fetchAnnouncements]);

    // Arama Filtresi
    const filteredAnnouncements = announcements.filter((a) =>
        a.eventName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative text-white">
            <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"></div>

            <div className="max-w-5xl mx-auto py-10 space-y-8">

                {/* ÜST BÖLÜM */}
                <div className="relative bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a] border border-[#3b82f6]/40 shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:shadow-[#3b82f6]/30 hover:scale-[1.01] transition-all duration-300 rounded-3xl p-8 overflow-hidden flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div>
                        <p className="text-sm uppercase tracking-[0.4em] text-[#93c5fd] mb-2">Kulüp Duyuruları</p>
                        <h1 className="text-4xl font-extrabold">Mevcut Duyurular</h1>
                        <p className="text-gray-300 mt-3 max-w-2xl">
                            Kulübünüz için yayımlanmış tüm duyuruları görüntüleyebilir ve hızlıca güncel durumu takip edebilirsiniz.
                        </p>
                    </div>

                    {/* ARAMA + YENİLE */}
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Etkinlik adına göre ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-3 rounded-2xl bg-[#0f0f1a] border border-[#3b82f6]/40 text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                        />

                        <button
                            onClick={fetchAnnouncements}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] shadow-lg font-semibold"
                        >
                            Yenile
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-[#0f0f1a]/80 border border-[#3b82f6]/20 rounded-3xl p-12 text-center text-gray-300">
                        Duyurular yükleniyor...
                    </div>
                ) : error ? (
                    <div className="bg-[#2b1b3f]/80 border border-red-500/30 rounded-3xl p-8 text-red-200 space-y-3">
                        <p>{error}</p>
                        <button
                            onClick={fetchAnnouncements}
                            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ef4444] to-[#b91c1c] text-white font-semibold"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="bg-[#0f0f1a]/80 border border-[#3b82f6]/20 rounded-3xl p-12 text-center text-gray-300">
                        Aramanıza uygun duyuru bulunamadı.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredAnnouncements.map((a) => (
                            <div
                                key={a.id}
                                className="p-6 bg-[#0f0f1a]/80 border border-[#3b82f6]/20 rounded-3xl shadow-xl relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] flex items-center justify-center text-2xl">
                                            📌
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.4em] text-[#93c5fd]">Etkinlik İsmi</p>
                                            <h3 className="text-2xl text-white font-bold">{a.eventName}</h3>
                                        </div>
                                    </div>

                                    <span className="text-sm text-gray-400 flex items-center gap-2">
                                        <span className="text-lg">📅</span>
                                        <span className="font-semibold">Duyuru Tarihi:</span> {formatDate(a.createdAt)}
                                    </span>
                                </div>

                                <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 text-[#93c5fd] uppercase tracking-[0.3em] text-xs">
                                        <span className="text-lg">📢</span>
                                        Duyuru Açıklaması
                                    </div>
                                    <p className="mt-3 text-gray-200 leading-relaxed">{a.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsListPage;
