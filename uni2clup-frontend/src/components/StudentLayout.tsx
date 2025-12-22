import React, { useState, useEffect, useCallback } from "react";

import ClubsPage from "../pages/StudentPages/ClubsPage";
import JoinedEventsPage from "../pages/StudentPages/JoinedEventsPage";
import ClubEventsPage from "../pages/StudentPages/ClubEventsPage";
import PastEventsPage from "../pages/StudentPages/PastEventsPage";
import ProfilePage from "../pages/StudentPages/ProfilePage";

const StudentLayout: React.FC = () => {
    const API_URL = "http://localhost:8080";
    const token = localStorage.getItem("token");
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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: "",
        message: "",
        description: "",
        onConfirm: () => { },
    });
    const [toast, setToast] = useState({ show: false, message: "", subtitle: "" });

    const showToast = (msg: string, subtitle: string) => {
        setToast({ show: true, message: msg, subtitle });
    };
    const [currentPage, setCurrentPage] = useState(1);
    const clubsPerPage = 4;
    const missedEvents = clubEvents
        .filter(ev => new Date(ev.endDate) < new Date()) 
        .filter(ev => !myEvents.some(j => j.id === ev.id)); 
    const joinedPastEvents = myEvents.filter(ev => {
        const end =
            ev.EndDate ||
            ev.Enddate ||
            ev.endDate ||
            ev.enddate ||
            ev.end_date;

        return end && new Date(end) < new Date();
    });

    const getEventStatus = (start: string, end: string) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);

        // Etkinlik şu an devam ediyor mu?
        if (s <= now && now <= e) {
            return { label: "Devam Ediyor", color: "bg-green-600 bg-gradient-to-r from-green-500/70 to-green-700/40 text-white" };
        }

        // Etkinlik gelecekte mi? 
        if (s > now) {
            return { label: "Yaklaşıyor", color: "bg-yellow-600 text-black bg-gradient-to-r from-yellow-500/70 to-yellow-700/40"   };
        }

        return null; 
    };


    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const [notifTab, setNotifTab] = useState<"unread" | "history">("unread");

    const formatDate = (date: string | undefined | null) => {
        if (!date) return "Tarih yok";

        const d = new Date(date);

        const day = d.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        const time = d.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        return `${day} ${time}`;
    };

    
    const checkToken = useCallback(() => {
        if (!token) {
            window.location.href = "/login";
            return false;
        }

        return true;
    }, [token]);

    // FETCH FUNCTIONS 
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

    const handleJoinClub = async (clubId) => {
        if (!checkToken()) return;

        setConfirmModal({
            show: true,
            title: "Kulübe katılmak istediğinize emin misiniz?",
            message: "Bu işlemi onayladığınızda kulübe katılacaksınız.",
            description: "Kulüp profilinize eklenecektir.",
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem("token");

                    const res = await fetch(`${API_URL}/api/studentpanel/clubs/${clubId}/join`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!res.ok) throw new Error("Katılım başarısız.");

                    
                    setClubs(prev =>
                        prev.map(club =>
                            club.id === clubId ? { ...club, isMember: true } : club
                        )
                    );

                    
                    fetchProfile();

                    
                    fetchNotifications();

                    showToast("Kulübe başarıyla katıldınız!", "Kulübünüz profilinize eklendi.");
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };



    const handleLeaveClub = async (clubId: number) => {
        if (!checkToken()) return;
        setConfirmModal({
            show: true,
            title: "Kulüpten ayrılmak istediğinize emin misiniz?",
            message: "Bu işlemi onayladığınızda kulüpten ayrılacaksınız.",
            description: "Ayrıldığınızda kulüp profilinizden kaldırılacaktır.",
            onConfirm: async () => {
                await fetch(`${API_URL}/api/studentpanel/clubs/${clubId}/leave`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });

                fetchClubs();
                fetchProfile();
                fetchNotifications();
                showToast("Kulüpten başarıyla ayrıldınız!", "Kulüp profilinizden kaldırıldı.");


            }
        });
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

            showToast(data.message, "Yeni deneyimlere hak kazandınız.");  
            fetchClubEvents();
            fetchMyEvents();

        } catch (err) {
            console.error("Etkinliğe katılırken hata:", err);
        }
    };

    const handleLeaveEventStarter = (eventId: number, eventName: string) => {
        setConfirmModal({
            show: true,
            title: "Etkinlikten ayrılmak istediğinize emin misiniz?",
            message: `"${eventName}" etkinliğinden ayrılmak üzeresiniz.`,
            description: "Ayrıldığınızda etkinlik listenizden kaldırılacaktır.",
            onConfirm: () => handleLeaveEvent(eventId)
        });
    };

    const handleLeaveEvent = async (eventId: number) => {
        if (!checkToken()) return;

        try {
            const res = await fetch(
                `${API_URL}/api/studentpanel/events/leave/${eventId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            const data = await res.json();

            showToast("Etkinlikten ayrıldınız!", "Etkinlik listenizden kaldırıldı.");

            fetchClubEvents();
            fetchMyEvents();

        } catch (err) {
            console.error("Etkinlikten ayrılırken hata:", err);
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

    

  



    const getClubIcon = (name: string, department?: string) => {
        const normalizeTR = (str: string) =>
            str
                .replace(/İ/g, "i")
                .replace(/I/g, "ı")
                .toLocaleLowerCase("tr")
                .trim();

        const dep = normalizeTR(department || name || "");

        
        if (dep === "bilgisayar mühendisliği") return { icon: "💻", color: "from-blue-600 to-cyan-500" };
        if (dep === "biyoloji") return { icon: "🧬", color: "from-green-500 to-emerald-600" };
        if (dep === "çevre mühendisliği") return { icon: "🌿", color: "from-green-400 to-lime-500" };
        if (dep === "elektrik-elektronik mühendisliği") return { icon: "⚡", color: "from-yellow-400 to-amber-500" };
        if (dep === "endüstri mühendisliği") return { icon: "🏭", color: "from-gray-400 to-gray-600" };
        if (dep === "fizik") return { icon: "⚛️", color: "from-purple-600 to-indigo-600" };
        if (dep === "güzel sanatlar") return { icon: "🎨", color: "from-pink-500 to-purple-500" };
        if (dep === "hukuk") return { icon: "⚖️", color: "from-yellow-600 to-orange-500" };
        if (dep === "iktisat") return { icon: "📊", color: "from-blue-500 to-blue-700" };
        if (dep === "işletme") return { icon: "💼", color: "from-indigo-600 to-purple-600" };
        if (dep === "inşaat mühendisliği") return { icon: "🏗️", color: "from-orange-500 to-yellow-600" };
        if (dep === "kimya") return { icon: "🧪", color: "from-green-600 to-teal-500" };
        if (dep === "makine mühendisliği") return { icon: "🔧", color: "from-gray-500 to-gray-700" };
        if (dep === "matematik") return { icon: "➗", color: "from-blue-400 to-blue-600" };
        if (dep === "psikoloji") return { icon: "🧠", color: "from-pink-400 to-purple-400" };
        if (dep === "yazılım mühendisliği") return { icon: "👨‍💻", color: "from-indigo-500 to-blue-500" };

        
        return { icon: "⭐", color: "from-[#2d1b69] to-[#3b82f6]" };
    };




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

            {/* 🔵 SOL SİDEBAR */}
            <div className="fixed top-0 left-0 h-screen w-90 border-r-2 border-[#3b82f6] flex flex-col p-6 shadow-2xl bg-[#0d102e]/90 backdrop-blur z-20">




                {/* Logo */}
                <div className="mb-10 flex flex-col items-center">
                    <img
                        src="ögrenci_paneli_logosu.png"
                        alt="U2C Logo"
                        className="w-32 h-32 object-contain drop-shadow-lg"
                    />

                    <h1 className="mt-4 text-3xl font-bold text-center 
                   bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] 
                   bg-clip-text text-transparent">
                        Uni2Clup Öğrenci Paneli
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
                        🎯 Kulüpler
                    </button>

                    {/* Etkinlik Dropdown */}
                    <div>
                        <button
                            onClick={() => setShowEventDropdown(!showEventDropdown)}
                            className="block w-full p-4 text-lg rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] 
                          border-2 border-transparent hover:border-[#3b82f6] transition-all duration-300 
                          flex justify-between items-center"
                        >
                            <span>📅 Etkinlikler</span>
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
                                    ✔ Katıldığım Etkinlikler
                                </button>

                                {/* Katıldığım Kulüplerin Etkinlikleri */}
                                <button
                                    onClick={() => setActiveMenu("club-events")}
                                    className={`block w-full text-left p-3 rounded-lg text-md transition-all duration-300 
                            ${activeMenu === "club-events" ? "bg-[#3b82f6]" : "hover:bg-[#2a2a3e]"}`}
                                >
                                    ⭐ Katıldığım Kulüplerin Etkinlikleri
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
                        🕒 Geçmiş Etkinlikler
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
                        👤 Profil
                    </button>

                </nav>

              
                {/* Çıkış Yap Butonu */}
                <button
                    onClick={() => {
                        setConfirmMessage("Öğrenci Panelinden çıkış yapmak istediğinize emin misiniz?");
                        setConfirmAction(() => () => handleLogout());
                        setShowConfirmModal(true);
                    }}
                    className="mt-auto w-full bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    <span>Çıkış Yap</span>
                </button>
            </div>


            {/* 🔵 SAĞ ANA ALAN */}
            <main className="relative flex-1 overflow-y-auto ml-[420px] h-screen">





                <div className="p-8 max-w-[90%]">

                    {activeMenu === "clubs" && (
                        <ClubsPage
                            clubs={clubs} 
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
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
                        <JoinedEventsPage
                            myEvents={myEvents}
                            formatDate={formatDate}
                            handleLeaveEventStarter={handleLeaveEventStarter}
                            getEventStatus={getEventStatus}
                        />
                    )}


                    {activeMenu === "club-events" && (
                        <ClubEventsPage
                            clubEvents={clubEvents
                                .filter(ev => !ev.isCancelled)  
                                .filter(ev => {
                                const end = new Date(ev.EndDate || ev.endDate);
                                return end >= new Date(); 
                            })}
                            handleJoinEvent={handleJoinEvent}
                            formatDate={formatDate}
                            getEventStatus={getEventStatus}
                        />

                    )}

                    {activeMenu === "past-events" && (
                        <PastEventsPage
                            pastEvents={joinedPastEvents}   
                            missedEvents={missedEvents}     
                            formatDate={formatDate}
                            refreshPastEvents={fetchPastEvents} 
                        />

                    )}


                    {activeMenu === "profile" && (
                        <ProfilePage
                            profile={profile}
                            getClubIcon={getClubIcon}
                            handleLeaveClub={handleLeaveClub}
                            myEvents={myEvents}
                            pastEvents={missedEvents}

                        />
                    )}


                </div>
            </main>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
                    <div className="bg-[#1a1a2e] p-8 rounded-xl border border-[#3b82f6] max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Onay Gerekli</h2>

                        <p className="text-gray-300 mb-8 text-center text-lg">
                            {confirmMessage}
                        </p>

                        <div className="flex gap-4">
                            <button
                                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold text-white"
                                onClick={() => {
                                    if (confirmAction) confirmAction();
                                    setShowConfirmModal(false);
                                }}
                            >
                                Evet
                            </button>

                            <button
                                className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold text-white"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Hayır
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {confirmModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e]
                        border border-[#3b82f6]/40 rounded-2xl p-8 w-[420px]
                        text-center shadow-2xl animate-scaleIn">

                        <h2 className="text-2xl font-bold text-white mb-3">
                            {confirmModal.title}
                        </h2>

                        <p className="text-gray-300 mb-8">
                            {confirmModal.message}
                        </p>
                        {confirmModal.description && (
                            <p className="text-gray-400 mb-8 text-sm">
                                {confirmModal.description}
                            </p>
                        )}


                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    confirmModal.onConfirm();
                                    setConfirmModal({ ...confirmModal, show: false });
                                }}
                                className="px-6 py-2 rounded-xl font-semibold text-white
                               bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
                               hover:scale-105 transition-all"
                            >
                                Onayla
                            </button>

                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                className="px-6 py-2 rounded-xl font-semibold text-gray-300
                               bg-[#2a2a3e] hover:bg-[#3a3a4a] hover:scale-105 
                               transition-all"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}


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

                {toast.show && (
                    <div className="fixed inset-0 flex items-center justify-center z-[9999]">

                        {/* Arka plan blur */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

                        {/* Modal kutusu */}
                        <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e]
            px-10 py-8 rounded-3xl text-center shadow-2xl border border-[#3b82f6]/40 
            animate-fadeIn min-w-[420px] max-w-[480px]">

                            {/* Başlık */}
                            <p className="text-2xl font-bold text-white mb-2">
                                ✔ {toast.message}
                            </p>

                            {/* Alt açıklama */}
                            <p className="text-gray-300 mb-6">
                                {toast.subtitle}
                            </p>


                            {/* Tamam Butonu */}
                            <button
                                onClick={() => setToast({ show: false, message: "", subtitle: "" })}

                                className="px-6 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8]
                text-white font-semibold shadow-md transition-all"
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                )}






            </div>
        </div>
    );
};

export default StudentLayout;

