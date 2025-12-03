import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

interface CancelledEvent {
    id: number;
    name: string;
    location: string;
    capacity: number;
    clubName: string;
    description: string;
    cancelReason: string;
    startDate: string;
    endDate: string;
}

const displayDate = (d: string) =>
    new Date(d).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

const CancelledEventsPage: React.FC = () => {
    const [events, setEvents] = useState<CancelledEvent[]>([]);
    const [filtered, setFiltered] = useState<CancelledEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchCancelledEvents();
    }, []);

    const fetchCancelledEvents = async () => {
        try {
            const res = await fetch(`${API_URL}/api/Events/cancelled`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                setEvents([]);
                setFiltered([]);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setEvents(data);
            setFiltered(data);
            setLoading(false);
        } catch {
            setEvents([]);
            setFiltered([]);
            setLoading(false);
        }
    };

    // 🔍 Arama Filtresi
    useEffect(() => {
        const term = searchTerm.toLowerCase();

        const f = events.filter((e) =>
            e.name.toLowerCase().includes(term) ||
            e.location.toLowerCase().includes(term) ||
            e.clubName.toLowerCase().includes(term) ||
            e.description.toLowerCase().includes(term) ||
            e.cancelReason.toLowerCase().includes(term)
        );

        setFiltered(f);
    }, [searchTerm, events]);


    return (
        <div className="relative min-h-screen text-white">

            {/* 🔥 ARKA PLAN */}
            <div className="absolute inset-0 -z-10 opacity-50 blur-[120px] 
                bg-gradient-to-br from-[#2d1b69] via-[#0f0f1a] to-[#3b82f6]"></div>

            {/* ✨ Yıldız Efekti */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[2px] h-[2px] bg-white/30 rounded-full animate-ping"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-6xl mx-auto py-12 px-4 space-y-10 relative z-10">

                {/* 🟦 ÜST BAŞLIK */}
                <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] 
                    border border-[#3b82f6]/30 rounded-3xl p-10 shadow-2xl">

                    <p className="text-sm uppercase tracking-[0.4em] text-[#93c5fd]">
                        Kulüp Etkinlikleri
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2">
                        <h1 className="text-4xl font-extrabold">
                            İptal Edilmiş Etkinlikler
                        </h1>

                        {/* 🔍 Arama Kutusu */}
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="İptal edilenlerde ara..."
                            className="mt-6 md:mt-0 px-4 py-3 rounded-2xl bg-[#1a1a2e] 
                                       border border-[#3b82f6]/40 w-full md:w-64 
                                       text-white placeholder-gray-400 shadow-lg"
                        />
                    </div>

                    <p className="text-gray-300 mt-3 max-w-2xl">
                        Kulübünüzde veya sistem genelinde iptal edilen tüm etkinlikler listelenmektedir.
                    </p>
                </div>

                {/* 📌 İPTAL EDİLENLER */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400 text-xl">Yükleniyor...</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-[#111326]/60 border border-[#3b82f6]/20 
                        rounded-3xl text-center py-20 text-gray-400 text-lg shadow-xl">
                        Hiç eşleşen iptal edilmiş etkinlik bulunamadı.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filtered.map((e) => (
                            <div key={e.id}
                                className="relative rounded-3xl border border-red-500/40 
                                    bg-[#0f0f1a]/80 shadow-xl p-8 hover:shadow-red-900/30 
                                    transition-all">

                                {/* 🔴 Badge */}
                                <div className="absolute top-4 right-4 px-4 py-1 rounded-full 
                                    text-sm font-semibold shadow-lg 
                                    bg-gradient-to-r from-red-600 to-red-800">
                                    İPTAL EDİLDİ
                                </div>

                                <h2 className="text-3xl font-bold text-red-400">{e.name}</h2>

                                <p className="text-gray-300 flex items-center gap-2 mt-2">
                                    📍 <b>Konum:</b> {e.location}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                        <p className="text-xs text-gray-400">Kontenjan</p>
                                        <p className="text-xl">{e.capacity} kişi</p>
                                    </div>

                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                        <p className="text-xs text-gray-400">Kulüp</p>
                                        <p className="text-xl">{e.clubName}</p>
                                    </div>

                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                        <p className="text-xs text-gray-400">Tarih</p>
                                        <p className="text-lg">
                                            {displayDate(e.startDate)} → {displayDate(e.endDate)}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-300 mt-5 leading-relaxed">
                                    ℹ️ <b>Açıklama:</b> {e.description}
                                </p>

                                <p className="mt-4 text-red-400 font-semibold text-lg">
                                    ❗ İptal Nedeni: {e.cancelReason}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CancelledEventsPage;
