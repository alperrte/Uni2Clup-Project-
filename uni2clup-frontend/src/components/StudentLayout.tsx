// StudentLayout.tsx
import React, { useState, useEffect, useCallback } from "react";

import ClubsPage from "../pages/ClubsPage";
import JoinedEventsPage from "../pages/JoinedEventsPage";
import ClubEventsPage from "../pages/ClubEventsPage";
import PastEventsPage from "../pages/PastEventsPage";
import ProfilePage from "../pages/ProfilePage";

const StudentLayout: React.FC = () => {
    const API_URL = "http://localhost:8080";
    const token = localStorage.getItem("token");

    // STATES (Aynen korunuyor)
    const [clubs, setClubs] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [clubEvents, setClubEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const historyNotifications = notifications.filter(n => n.isRead);
    const [notificationsFilter, setNotificationsFilter] = useState<"unread" | "all">("all");
    const [showNotifications, setShowNotifications] = useState(false);
    const [profile, setProfile] = useState(null);
    const [activeMenu, setActiveMenu] = useState("clubs");
    const [searchTerm, setSearchTerm] = useState("");
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState("");
    const [showEventDropdown, setShowEventDropdown] = useState(false);

    const [notifTab, setNotifTab] = useState<"unread" | "history">("unread");

    const formatDate = (date: string | undefined | null) => {
        if (!date) return "Tarih yok";
        return new Date(date).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getClubIcon = () => ({
        icon: "★",
        color: "from-[#2d1b69] to-[#3b82f6]"
    });

    const checkToken = useCallback(() => {
        if (!token) {
            alert("Oturum süresi doldu.");
            localStorage.clear();
            window.location.reload();
            return false;
        }
        return true;
    }, [token]);

    // FETCH FUNCTIONS (Hiçbirine dokunulmadı)
    const fetchClubs = async () => {
        if (!checkToken()) return;
        try {
            const res = await fetch(`${API_URL}/api/studentpanel/clubs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClubs(await res.json());
        } catch { }
    };

    const fetchMyEvents = async () => {
        if (!checkToken()) return;
        try {
            const res = await fetch(`${API_URL}/api/studentpanel/events/joined`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyEvents(await res.json());
        } catch { }
    };

    const fetchClubEvents = async () => {
        if (!checkToken()) return;
        try {
            const res = await fetch(`${API_URL}/api/studentpanel/events/member-clubs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClubEvents(await res.json());
        } catch { }
    };

    const fetchPastEvents = async () => {
        if (!checkToken()) return;
        try {
            const res = await fetch(`${API_URL}/api/studentpanel/events/past`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPastEvents(await res.json());
        } catch { }
    };

    const fetchNotifications = async () => {
        if (!checkToken()) return;

        try {
            const endpoint =
                notificationsFilter === "unread"
                    ? `${API_URL}/api/studentpanel/notifications/unread`
                    : `${API_URL}/api/studentpanel/notifications/all`;

            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(await res.json());
        } catch { }
    };

    const fetchProfile = async () => {
        if (!checkToken()) return;
        try {
            const res = await fetch(`${API_URL}/api/studentpanel/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(await res.json());
        } catch { }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_URL}/api/department`);
            setDepartments(await res.json());
        } catch { }
    };

    const handleJoinClub = async (clubId: number) => {
        if (!checkToken()) return;
        if (!window.confirm("Bu kulübe katılmak istediğinize emin misiniz?")) return;

        await fetch(`${API_URL}/api/studentpanel/clubs/${clubId}/join`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });

        fetchClubs();
        fetchProfile();
        fetchNotifications();
    };

    const handleLeaveClub = async (clubId: number) => {
        if (!checkToken()) return;
        if (!window.confirm("Bu kulüpten ayrılmak istediğinize emin misiniz?")) return;

        await fetch(`${API_URL}/api/studentpanel/clubs/${clubId}/leave`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });

        fetchClubs();
        fetchProfile();
        fetchNotifications();
    };

    const handleJoinEvent = async (eventId: number) => {
        if (!checkToken()) return;

        try {
            const res = await fetch(
                `${API_URL}/api/studentpanel/events/join/${eventId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            const data = await res.json();
            alert(data.message);

            // Sayfayı güncelle
            fetchClubEvents();
            fetchMyEvents();

        } catch (err) {
            console.error("Etkinliğe katılırken hata:", err);
        }
    };


    const handleMarkAsRead = async (notifId: number) => {
        try {
            await fetch(`${API_URL}/api/studentpanel/notifications/${notifId}/read`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            fetchNotifications();
        } catch { }
    };

    // LOAD ALL
    useEffect(() => {
        fetchClubs();
        fetchMyEvents();
        fetchClubEvents();
        fetchPastEvents();
        fetchNotifications();
        fetchProfile();
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [notificationsFilter]);

    const filteredClubs = clubs.filter((club: any) => {
        const matchesSearch =
            (club.name || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept =
            selectedDept === "" || club.departmentId === Number(selectedDept);

        return matchesSearch && matchesDept;
    });

    const filteredNotifications =
        notificationsFilter === "unread"
            ? notifications.filter((n: any) => !n.isRead)
            : notifications;

    // ---------------------------------------------------------------------
    // ---------------------------------------------------------------------
    // 🎨 TASARIM BURADAN BAŞLIYOR – AdminLayout TASARIMI UYGULANDI
    // ---------------------------------------------------------------------
    // ---------------------------------------------------------------------

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex relative overflow-hidden">

            {/* 🔵 Arka Plan Animasyonları */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-15 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#1e3a8a] to-[#2d1b69] rounded-full opacity-10 animate-pulse delay-1000"></div>
            </div>

            {/* 🔵 Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#3b82f6] rounded-full animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* 🔵 SOL SİDEBAR (AdminLayout ile aynı tasarım + daha büyük yazılar) */}
            <div className="fixed top-0 left-0 h-screen w-72 border-r-2 border-[#3b82f6] flex flex-col p-6 shadow-2xl bg-[#0d102e]/90 backdrop-blur z-20">


                {/* Logo */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                        Öğrenci Paneli
                    </h1>
                </div>

                {/* Menü */}
                <nav className="flex-grow space-y-2 overflow-y-auto pr-2">

                    {/* Kulüpler */}
                    <button
                        onClick={() => setActiveMenu("clubs")}
                        className={`block w-full text-left p-4 rounded-xl text-lg transition-all duration-300 
                ${activeMenu === "clubs"
                                ? "bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] shadow-lg"
                                : "bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] hover:border-[#3b82f6] border-2 border-transparent"
                            }`}
                    >
                        Kulüpler
                    </button>

                    {/* Etkinlik Dropdown */}
                    <div>
                        <button
                            onClick={() => setShowEventDropdown(!showEventDropdown)}
                            className="block w-full p-4 text-lg rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] 
                          border-2 border-transparent hover:border-[#3b82f6] transition-all duration-300 
                          flex justify-between items-center"
                        >
                            <span>Etkinlikler</span>
                            <span>{showEventDropdown ? "▲" : "▶"}</span>
                        </button>

                        {showEventDropdown && (
                            <div className="ml-4 mt-2 space-y-2">

                                {/* Katıldığım Etkinlikler */}
                                <button
                                    onClick={() => setActiveMenu("joined-events")}
                                    className={`block w-full text-left p-3 rounded-lg text-md transition-all duration-300 
                            ${activeMenu === "joined-events" ? "bg-[#3b82f6]" : "hover:bg-[#2a2a3e]"}`}
                                >
                                    Katıldığım Etkinlikler
                                </button>

                                {/* Üyesi Olduğum Kulüp Etkinlikleri */}
                                <button
                                    onClick={() => setActiveMenu("club-events")}
                                    className={`block w-full text-left p-3 rounded-lg text-md transition-all duration-300 
                            ${activeMenu === "club-events" ? "bg-[#3b82f6]" : "hover:bg-[#2a2a3e]"}`}
                                >
                                    Üyesi Olduğum Kulüp Etkinlikleri
                                </button>

                            </div>
                        )}
                    </div>

                    {/* Geçmiş Etkinlikler */}
                    <button
                        onClick={() => setActiveMenu("past-events")}
                        className={`block w-full text-left p-4 text-lg rounded-xl transition-all duration-300 
                ${activeMenu === "past-events"
                                ? "bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]"
                                : "bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] hover:border-[#3b82f6] border-2 border-transparent"
                            }`}
                    >
                        Geçmiş Etkinlikler
                    </button>

                    {/* Profil */}
                    <button
                        onClick={() => setActiveMenu("profile")}
                        className={`block w-full text-left p-4 text-lg rounded-xl transition-all duration-300 
                ${activeMenu === "profile"
                                ? "bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]"
                                : "bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] hover:border-[#3b82f6] border-2 border-transparent"
                            }`}
                    >
                        Profil
                    </button>

                </nav>

                {/* Çıkış Yap */}
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                    className="mt-6 w-full bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-4 px-6 rounded-xl 
                   transition-all duration-300 hover:scale-105"
                >
                    Çıkış Yap
                </button>

            </div>


            {/* 🔵 SAĞ ANA ALAN */}
            <main className="relative z-10 flex-1 overflow-y-auto ml-72 h-screen">



                <div className="p-8">

                    {activeMenu === "clubs" && (
                        <ClubsPage
                            clubs={filteredClubs}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            departments={departments}
                            selectedDept={selectedDept}
                            setSelectedDept={setSelectedDept}
                            handleJoinClub={handleJoinClub}
                            handleLeaveClub={handleLeaveClub}
                            getClubIcon={getClubIcon}
                        />
                    )}

                    {activeMenu === "joined-events" && (
                        <JoinedEventsPage myEvents={myEvents} formatDate={formatDate} />
                    )}

                    {activeMenu === "club-events" && (
                        <ClubEventsPage
                            clubEvents={clubEvents}
                            handleJoinEvent={handleJoinEvent}   // ✔ ARTIK GERÇEK FONKSİYON
                            formatDate={formatDate}
                        />
                    )}

                    {activeMenu === "past-events" && (
                        <PastEventsPage pastEvents={pastEvents} formatDate={formatDate} />
                    )}

                    {activeMenu === "profile" && (
                        <ProfilePage
                            profile={profile}
                            getClubIcon={getClubIcon}
                            handleLeaveClub={handleLeaveClub}
                        />
                    )}


                </div>
            </main>

            {/* 🔔 BİLDİRİM SİMGESİ */}
            <div className="absolute right-8 top-6 z-50">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative bg-[#2d1b69] p-3 rounded-full hover:bg-[#3b82f6] transition-all"
                >
                    <span className="text-2xl">🔔</span>

                    {notifications.some((n: any) => !n.isRead) && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {notifications.filter((n: any) => !n.isRead).length}
                        </span>
                    )}
                </button>

                {showNotifications && (
                    <div className="absolute right-0 mt-3 w-96 bg-[#1a1a2e] border border-[#3b82f6] rounded-xl p-4 shadow-2xl z-50">

                        {/* 🔵 SEKME BAŞLIKLARI */}
                        <div className="flex mb-4 border-b border-[#3b82f6]/40">
                            <button
                                onClick={() => setNotifTab("unread")}
                                className={`flex-1 py-2 text-center ${notifTab === "unread"
                                        ? "text-[#3b82f6] border-b-2 border-[#3b82f6]"
                                        : "text-gray-400"
                                    }`}
                            >
                                Okunmamış
                            </button>

                            <button
                                onClick={() => setNotifTab("history")}
                                className={`flex-1 py-2 text-center ${notifTab === "history"
                                        ? "text-[#3b82f6] border-b-2 border-[#3b82f6]"
                                        : "text-gray-400"
                                    }`}
                            >
                                Geçmiş
                            </button>
                        </div>

                        {/* 🔵 BİLDİRİMLERİN LİSTESİ */}
                        <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {(notifTab === "unread" ? unreadNotifications : historyNotifications)
                                .map((n: any) => (
                                    <li
                                        key={n.id}
                                        className="p-3 rounded-lg bg-[#2a2a3e] flex justify-between items-center"
                                    >
                                        <span className="text-gray-200 text-sm">{n.message}</span>

                                        {!n.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(n.id)}
                                                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md text-white"
                                            >
                                                Okundu
                                            </button>
                                        )}
                                    </li>
                                ))}
                        </ul>

                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentLayout;

