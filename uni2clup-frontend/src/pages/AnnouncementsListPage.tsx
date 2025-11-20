import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";
const token = localStorage.getItem("token");
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
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`${API_URL}/api/announcements/list`, {
                headers: { Authorization: `Bearer ${token}` }
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
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    return (
        <div className="max-w-4xl mx-auto mt-10 text-white">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-bold">📰 Mevcut Duyurular</h1>
                <button
                    onClick={fetchAnnouncements}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
                >
                    Yenile
                </button>
            </div>

            {loading ? (
                <p className="text-gray-300">Duyurular yükleniyor...</p>
            ) : error ? (
                <div className="text-red-400">
                    <p>{error}</p>
                    <button
                        onClick={fetchAnnouncements}
                        className="mt-2 px-4 py-2 rounded-lg bg-blue-600"
                    >
                        Tekrar Dene
                    </button>
                </div>
            ) : announcements.length === 0 ? (
                <p className="text-gray-400">Henüz duyuru bulunmuyor.</p>
            ) : (
                <div className="space-y-4">
                    {announcements.map((a) => (
                        <div
                            key={a.id}
                            className="p-5 bg-[#1a1a2e] border border-[#3b82f6] rounded-2xl shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl text-[#3b82f6] font-bold">{a.eventName}</h3>
                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                    📅 {formatDate(a.createdAt)}
                                </span>
                            </div>
                            <p className="mt-3 text-gray-200">{a.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementsListPage;

