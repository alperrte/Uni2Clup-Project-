import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
    children: React.ReactNode;
    handleLogout?: () => void;
}

const menuItems = [
    { name: "Yeni Etkinlik Oluştur", path: "/club/create-event", icon: "➕" },
    { name: "Duyuru Oluştur", path: "/club/announcements", icon: "📢" },
    { name: "Etkinlikler", path: "/club/events", icon: "📅" },
    { name: "Duyurular", path: "/club/announcements-list", icon: "📰" },
    { name: "Kulüp Üyeleri", path: "/club/members", icon: "👥" },
    { name: "Ayarlar", path: "/club/settings", icon: "⚙️" },
];

const ClubManagerLayout: React.FC<LayoutProps> = ({ children, handleLogout }) => {
    const location = useLocation();
    const [clubName, setClubName] = useState<string>("");
    const [clubError, setClubError] = useState<string>("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const fetchClub = async () => {
            try {
                setClubError("");
                const res = await fetch("http://localhost:8080/api/Club/my-club", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || "Kulüp bilgisi alınamadı.");
                }

                const data = await res.json();
                setClubName(data?.name || "");
            } catch (error: any) {
                console.error(error);
                setClubError(error.message);
            }
        };

        fetchClub();
    }, []);

    return (
        <div className="min-h-screen text-white flex relative overflow-hidden bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a]">
            {/* Animated background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-[#1e3a8a] to-[#2d1b69] rounded-full opacity-10 blur-3xl"></div>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#3b82f6] rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99999]">
                    <div className="bg-[#1a1a2e] p-8 rounded-xl border border-[#3b82f6] max-w-md w-full mx-4">

                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Onay Gerekli</h2>

                        <p className="text-gray-300 mb-8 text-center text-lg">
                            Kulüp Panelinden çıkış yapmak istediğinize emin misiniz?
                        </p>

                        <div className="flex gap-4">
                            <button
                                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold text-white"
                                onClick={() => {
                                    handleLogout && handleLogout();
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

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen 
w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80
bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] border-r-2 border-[#3b82f6] flex flex-col justify-between p-6 shadow-2xl">

                {/* 🔵 SOL ÜST LOGO */}
                <div className="mb-6 text-center mt-4 flex flex-col items-center justify-center">
                    {/* Glow arka plan */}
                    <div className="absolute w-48 h-48 bg-[#3b82f6] blur-3xl opacity-20 rounded-full"></div>

                    {/* Logo */}
                    <img
                        src="/kulüp-paneli-logosu.png"
                        alt="Kulüp Paneli Logosu"
                        className="w-40 h-40 object-contain relative z-10"
                    />

                    <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">

                        Uni2Clup Kulüp Paneli
                    </h1>
                    <p className="mt-4 text-lg font-semibold text-white">
                        {clubName
                            ? `Yönetilen Kulüp - ${clubName}`
                            : (clubError || "Kulüp bilgisi yükleniyor...")}
                    </p>
                </div>

                <nav className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1">
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group relative block h-12 sm:h-14 md:h-16 flex items-center px-4 rounded-2xl transition-all duration-300 ${isActive
                                    ? "bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] shadow-lg shadow-[#3b82f6]/40"
                                    : "bg-gradient-to-r from-[#111133] to-[#1a1a3e] hover:shadow-lg hover:shadow-[#1e40af]/30 border border-transparent hover:border-[#3b82f6]/40"
                                    }`}
                            >
                                <div className="flex items-center gap-4 w-full">
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className={`font-semibold text-sm sm:text-base md:text-lg ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                                        {item.name}
                                    </span>
                                </div>
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 rounded-2xl"></div>
                                )}
                            </Link>
                        );
                    })}

                    <div className="pt-6 border-t border-[#3b82f6]/30">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="w-full bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2H18.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                            </svg>
                            <span>Çıkış Yap</span>
                        </button>
                    </div>





                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto 
ml-64 md:ml-72 lg:ml-80
h-screen">


                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default ClubManagerLayout;