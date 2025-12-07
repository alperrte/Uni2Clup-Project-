import React, { useState, useEffect, useCallback, useMemo } from "react";
import EventForm from "../../components/EventForm";

interface Event {
    id: number;
    Name: string;
    Capacity: number;
    Location: string;
    StartDate: string;
    EndDate: string;
    ClubName: string;
    Description: string;
    ratingPercent?: number;
    ratingCount?: number;

}

const TURKEY_TIME_ZONE = "Europe/Istanbul";

const displayFormatter = new Intl.DateTimeFormat("tr-TR", {
    timeZone: TURKEY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
});

const inputFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TURKEY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

const parseEventDate = (value: string) => {
    if (!value) return null;
    const date = new Date(value); 
    return isNaN(date.getTime()) ? null : date;
};


const formatForDisplay = (value: string) => {
    const date = parseEventDate(value);
    if (!date) return value;
    return displayFormatter.format(date);
};

const formatForInput = (value: string) => {
    if (!value) return "";
    const date = parseEventDate(value);
    if (!date) return "";
    const parts = inputFormatter
        .formatToParts(date)
        .reduce<Record<string, string>>((acc, part) => {
            if (part.type !== "literal") acc[part.type] = part.value;
            return acc;
        }, {});

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

const toTurkeyTime = (dateString: string) => {
    const utc = new Date(dateString);
    const turkey = new Date(utc.getTime() + 3 * 60 * 60 * 1000);
    return turkey.toLocaleString("tr-TR");
};

const EventPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filter, setFilter] = useState("Tümü");
    const [nameFilter, setNameFilter] = useState("Tüm İsimler");
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);

    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [participants, setParticipants] = useState<any[]>([]);
    const [participantsModalOpen, setParticipantsModalOpen] = useState(false);

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelEventId, setCancelEventId] = useState<number | null>(null);

    const [confirmCancelModal, setConfirmCancelModal] = useState(false);
    const [confirmCancelData, setConfirmCancelData] = useState<any>(null);

    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const API_URL = "http://localhost:8080";
    const token = localStorage.getItem("token");

    const getStatus = (start: string, end: string) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);

        if (now < s) return "Yaklaşıyor";
        if (now > e) return "Bitti";
        return "Devam Ediyor";
    };

    const fetchParticipants = async (eventId: number) => {
        try {
            const res = await fetch(`${API_URL}/api/events/participants/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setParticipants(await res.json());
            setParticipantsModalOpen(true);
        } catch { }
    };

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/events/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            const normalized: Event[] = data
                .filter((e: any) => !e.isCancelled)  
                .map((e: any) => ({
                    id: e.id ?? e.Id,
                    Name: e.name ?? e.Name,
                    Capacity: e.capacity ?? e.Capacity,
                    Location: e.location ?? e.Location,
                    StartDate: e.startDate ?? e.StartDate,
                    EndDate: e.endDate ?? e.EndDate,
                    ClubName: e.clubName ?? e.ClubName,
                    Description: e.description ?? e.Description,
                }));


            // Her etkinlik için değerlendirme yüzdesi çek
            for (let ev of normalized) {
                try {
                    const r = await fetch(`${API_URL}/api/events/${ev.id}/ratings-summary`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (r.ok) {
                        const rd = await r.json();
                        ev.ratingPercent = rd.percent;
                        ev.ratingCount = rd.total;
                    }
                } catch (err) {
                    console.error("Rating fetch error:", err);
                }
            }



            setEvents(normalized);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const onEdit = (ev: Event) => {
        setEditingEvent({
            id: ev.id,
            name: ev.Name,
            capacity: ev.Capacity.toString(),
            location: ev.Location,
            startDate: formatForInput(ev.StartDate),
            endDate: formatForInput(ev.EndDate),
            clubName: ev.ClubName,
            description: ev.Description,
        });
        setIsModalOpen(true);
    };

    const handleUpdate = async (formData: any) => {
        const id = formData.Id || editingEvent?.id;
        if (!id) {
            alert("Etkinlik ID bulunamadı.");
            return;
        }

        console.log("🔄 Güncelleme isteği gidiyor:", { id, formData });

        const res = await fetch(`${API_URL}/api/Events/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        let data: any = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }

        console.log("📥 Güncelleme cevabı:", res.status, data);

        if (!res.ok) {
            alert(data?.message || "Güncelleme sırasında bir hata oluştu.");
            return;
        }


        setIsModalOpen(false);
        setEditingEvent(null);
        fetchEvents();
    };

    const handleCancelEvent = () => {
        if (!cancelEventId) return;
        if (!cancelReason.trim()) return alert("İptal nedeni yazınız.");

        setCancelModalOpen(false);

        setConfirmCancelData({
            id: cancelEventId,
            reason: cancelReason,
        });

        setConfirmCancelModal(true);
    };

    const uniqueNames = useMemo(
        () => Array.from(new Set(events.map((e) => e.Name))),
        [events]
    );

    const filtered = events.filter((ev) => {
        const status = getStatus(ev.StartDate, ev.EndDate);
        const statusOk = filter === "Tümü" || status === filter;

        const s = searchTerm.toLowerCase();
        const searchOk =
            s === "" ||
            ev.Name.toLowerCase().includes(s) ||
            ev.Location.toLowerCase().includes(s);

        return statusOk && searchOk;
    });


    return (
        <>
            {/* ✔ Başarı Modalı */}
            {successModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
                    <div className="bg-[#0f0f1a] p-6 rounded-2xl border border-green-500/40 w-full max-w-md text-center">
                        <h2 className="text-2xl font-bold text-green-400 mb-4">✔ Başarılı</h2>
                        <p className="text-gray-300 mb-6">{successMessage}</p>

                        <button
                            onClick={() => setSuccessModalOpen(false)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold"
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}

            <div className="relative">
                <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900"></div>

                <div className="max-w-6xl mx-auto py-10 space-y-8 text-white">

                    {/* ÜST FİLTRE KARTI */}
                    <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] border border-[#3b82f6]/30
                        rounded-3xl p-8 shadow-2xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        <div>
                            <p className="text-sm uppercase tracking-[0.4em] text-[#93c5fd] mb-2">
                                Kulüp Etkinlikleri
                            </p>
                            <h1 className="text-4xl font-extrabold">Etkinlik Paneli</h1>
                            <p className="text-gray-300 mt-2 max-w-xl">
                                Etkinlikleri görüntüleyebilir, güncelleyebilir veya iptal edebilirsiniz.
                            </p>
                        </div>

                        {/* FİLTRELER */}
                        <div className="flex flex-col sm:flex-row items-end md:items-center gap-3 relative">


                            {/* 🔴 İptal Edilen Etkinlikler Butonu */}
                            <button
                                onClick={() => window.location.href = "/club/cancelled-events"}
                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold shadow-lg hover:scale-105 transition-all"
                            >
                                ❌ İptal Edilenler
                            </button>

                            {/* 🔍 Arama Kutusu */}
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Etkinlik ara..."
                                className="px-4 py-3 rounded-2xl bg-[#1a1a2e] border border-[#3b82f6]/40 w-48 text-white"
                            />

                            {/* 🟦 Durum Filtresi */}
                            <div className="relative z-50">
                                <button
                                    onClick={() => setOpen((prev) => !prev)}
                                    className={`
                px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all font-semibold
                ${filter === "Devam Ediyor" ? "bg-green-600" : ""}
                ${filter === "Yaklaşıyor" ? "bg-yellow-600 text-black" : ""}
                ${filter === "Bitti" ? "bg-red-600" : ""}
                ${filter === "Tümü" ? "bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]" : ""}
            `}
                                >
                                    <span>{filter}</span>

                                    {/* Modern arrow icon */}
                                    <svg
                                        className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menü */}
                                {open && (
                                    <div className="absolute right-0 mt-3 bg-[#0f0f1a] w-52 rounded-2xl border border-[#3b82f6]/40 shadow-xl overflow-hidden">

                                        <div
                                            onClick={() => { setFilter("Tümü"); setOpen(false); }}
                                            className="px-5 py-3 hover:bg-[#1d2760] cursor-pointer text-white">
                                            🔵 Tümü
                                        </div>

                                        <div
                                            onClick={() => { setFilter("Devam Ediyor"); setOpen(false); }}
                                            className="px-5 py-3 hover:bg-green-500/20 cursor-pointer text-green-400">
                                            🟢 Devam Ediyor
                                        </div>

                                        <div
                                            onClick={() => { setFilter("Yaklaşıyor"); setOpen(false); }}
                                            className="px-5 py-3 hover:bg-yellow-500/20 cursor-pointer text-yellow-300">
                                            🟡 Yaklaşıyor
                                        </div>

                                        <div
                                            onClick={() => { setFilter("Bitti"); setOpen(false); }}
                                            className="px-5 py-3 hover:bg-red-500/20 cursor-pointer text-red-400">
                                            🔴 Bitti
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>


</div>
                    {/* ETKİNLİK LİSTESİ */}
                    {isLoading ? (
                        <div className="text-center p-10">Yükleniyor...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center p-10">Gösterilecek etkinlik yok.</div>
                    ) : (
                        <div className="space-y-5">
                            {filtered.map((ev) => {
                                const status = getStatus(ev.StartDate, ev.EndDate);
                                const color =
                                    status === "Devam Ediyor"
                                        ? "from-green-500/70 to-green-700/40"
                                        : status === "Yaklaşıyor"
                                            ? "from-yellow-500/70 to-yellow-700/40"
                                            : "from-red-500/70 to-red-700/40";

                                return (
                                    <div key={ev.id}
                                        className="relative rounded-3xl border border-[#3b82f6]/20 bg-[#0f0f1a]/80 shadow-xl p-6">

                                        <div className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm bg-gradient-to-r ${color}`}>
                                            {status}
                                        </div>

                                        <h3 className="text-2xl font-bold text-[#93c5fd]">{ev.Name}</h3>

                                        <p className="text-gray-300 flex items-center gap-2 mt-2">
                                            📍 <b>Konum:</b> {ev.Location}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-4">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <p className="text-xs text-gray-400">Kontenjan</p>
                                                <p className="text-lg">{ev.Capacity} kişi</p>
                                            </div>

                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <p className="text-xs text-gray-400">Kulüp</p>
                                                <p className="text-lg">{ev.ClubName}</p>
                                            </div>

                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <p className="text-xs text-gray-400">Tarih</p>
                                                <p className="text-lg">
                                                    {formatForDisplay(ev.StartDate)} →
                                                    {formatForDisplay(ev.EndDate)}
                                                </p>
                                            </div>



                                        </div>

                                        {ev.ratingPercent !== undefined && (
                                            <div className="mt-4 bg-blue-900/40 border border-blue-400/40 p-4 rounded-2xl shadow-md">
                                                <p className="text-blue-300 text-sm">Etkinlik Değerlendirme Sonucu</p>

                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="text-4xl font-extrabold text-blue-400">
                                                        %{ev.ratingPercent}
                                                    </div>

                                                    <div className="text-gray-300 text-sm">
                                                        <b>{ev.ratingCount}</b> öğrenci değerlendirdi
                                                    </div>
                                                </div>

                                                <div className="w-full bg-blue-950 rounded-full h-3 mt-3">
                                                    <div
                                                        className="bg-blue-500 h-3 rounded-full"
                                                        style={{ width: `${ev.ratingPercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-gray-300 mt-3">
                                            ℹ️ <b>Açıklama:</b> {ev.Description}
                                        </p>

                                        <div className="flex flex-wrap gap-3 mt-4">
                                            <button
                                                onClick={() => onEdit(ev)}
                                                className="px-5 py-3 rounded-2xl bg-yellow-500 text-black font-semibold shadow-lg">
                                                ✏️ Güncelle
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setCancelEventId(ev.id);
                                                    setCancelModalOpen(true);
                                                }}
                                                className="px-5 py-3 rounded-2xl bg-red-600 text-white font-semibold shadow-lg">
                                                🗑 İptal Et
                                            </button>

                                            <button
                                                onClick={() => fetchParticipants(ev.id)}
                                                className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg">
                                                👥 Katılanlar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>


            {/* GÜNCELLEME MODALI */}
            {isModalOpen && editingEvent && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f0f1a] p-6 rounded-2xl border border-[#3b82f6] w-full max-w-3xl relative">

                        <button
                            onClick={() => { setIsModalOpen(false); setEditingEvent(null); }}
                            className="absolute top-3 right-3 text-white text-2xl">×</button>

                        <h2 className="text-2xl mb-4 font-bold text-white">Etkinliği Güncelle</h2>

                        <EventForm
                            onSave={handleUpdate}
                            selectedEvent={editingEvent}
                            clearSelected={() => {
                                setEditingEvent(null);
                                setIsModalOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* İPTAL NEDENİ MODALI */}
            {cancelModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f0f1a] p-6 rounded-2xl border border-red-500/40 w-full max-w-md relative">

                        <button
                            onClick={() => setCancelModalOpen(false)}
                            className="absolute top-3 right-3 text-white text-2xl">×</button>

                        <h2 className="text-2xl font-bold text-white mb-4">Etkinliği İptal Et</h2>

                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="İptal nedeni yazınız..."
                            className="w-full p-3 rounded-lg bg-[#1a1a2e] text-white border border-red-500/40"
                            rows={4}
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setCancelModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-xl">
                                Vazgeç
                            </button>

                            <button
                                onClick={handleCancelEvent}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl">
                                Devam Et
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SON ONAY MODALI */}
            {confirmCancelModal && confirmCancelData && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f0f1a] p-6 rounded-2xl border border-red-500 w-full max-w-md relative">

                        <h2 className="text-2xl font-bold text-white mb-4">Son Onay</h2>

                        <p className="text-gray-300 mb-6">
                            Bu etkinliği iptal etmek istediğinize emin misiniz?
                        </p>

                        <p className="text-gray-400 mb-6">
                            <b className="text-white">Neden:</b> {confirmCancelData.reason}
                        </p>

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => setConfirmCancelModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-xl">
                                Vazgeç
                            </button>

                            <button
                                onClick={async () => {
                                    const res = await fetch(
                                        `${API_URL}/api/events/cancel/${confirmCancelData.id}`,
                                        {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({ reason: confirmCancelData.reason })
                                        }
                                    );

                                    if (res.ok) {
                                        setConfirmCancelModal(false);

                                        setSuccessMessage(
                                            `Etkinlik iptal edilmiştir.\nNeden: ${confirmCancelData.reason}`
                                        );
                                        setSuccessModalOpen(true);

                                        fetchEvents();
                                    } else {
                                        alert("Etkinlik iptal edilemedi.");
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold">
                                Gönder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Katılımcı Modalı */}
            {participantsModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f0f1a] p-6 rounded-2xl border border-[#3b82f6]/40 w-full max-w-3xl relative">

                        {/* Kapat */}
                        <button
                            onClick={() => setParticipantsModalOpen(false)}
                            className="absolute top-3 right-3 text-white text-2xl">×</button>

                        <h2 className="text-3xl font-bold text-white mb-6">Katılan Öğrenciler</h2>

                        {/* 🔍 Arama Kutusu */}
                        <input
                            type="text"
                            placeholder="Email ile ara..."
                            onChange={(e) => {
                                const term = e.target.value.toLowerCase();
                                setParticipants((prev) =>
                                    prev.map(p => ({ ...p, hidden: !p.email.toLowerCase().includes(term) }))
                                );
                            }}
                            className="w-full p-3 rounded-xl bg-[#1a1a2e] border border-[#3b82f6]/40 text-white mb-6"
                        />

                        {participants.length === 0 ? (
                            <p className="text-gray-400">Henüz katılım yok.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">

                                {participants
                                    .filter(p => !p.hidden)
                                    .map((p) => (
                                        <div
                                            key={p.id}
                                            className="bg-[#111326] border border-[#3b82f6]/30 p-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
                                        >
                                            <p className="text-white text-lg font-semibold flex items-center gap-2">
                                                👤 {p.name} {p.surname}
                                            </p>

                                            <p className="text-gray-300 text-sm mt-2 flex items-center gap-2">
                                                📧 <span className="break-all">{p.email}</span>
                                            </p>

                                            <p className="text-gray-300 text-sm mt-2 flex items-center gap-2">
                                                🎓 {p.departmentName}
                                            </p>

                                            <p className="text-gray-300 text-sm mt-2 flex items-center gap-2">
                                                📅 {toTurkeyTime(p.joinedAt)}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </>
    );
};

export default EventPage;
