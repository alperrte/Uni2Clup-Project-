import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
    children: React.ReactNode;
    handleLogout?: () => void;
}

const ClubManagerLayout: React.FC<LayoutProps> = ({ children, handleLogout }) => {
    const location = useLocation();
    const [clubName, setClubName] = useState<string>("");
    const [clubError, setClubError] = useState<string>("");

    const menuItems = [
        { name: "Yeni Etkinlik Oluştur", path: "/club/create-event", icon: "➕" },
        { name: "Duyuru Oluştur", path: "/club/announcements", icon: "📢" },
        { name: "Etkinlikler", path: "/club/events", icon: "📅" },
        { name: "Duyurular", path: "/club/announcements-list", icon: "📰" },
        { name: "Kulüp Üyeleri", path: "/club/members", icon: "👥" },
        { name: "Ayarlar", path: "/club/settings", icon: "⚙️" },
    ];

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
        <div className="min-h-screen flex bg-[#0a0f2d] text-white">

            {/* SOL MENÜ */}
            <div className="w-72 bg-[#0d102e] border-r border-white/10 flex flex-col p-6">

                {/* LOGO */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
                        ✔️
                    </div>
                    <h1 className="text-2xl font-bold mt-4 text-center leading-tight">
                        Uni2Clup <br /> Kulüp Yönetim Paneli
                    </h1>
                    <p className="mt-3 text-center text-lg text-white font-semibold px-2">
                        {clubName
                            ? `Aktif Kulüp - ${clubName}`
                            : (clubError ? clubError : "Kulüp bilgisi yükleniyor...")}
                    </p>
                </div>

                {/* MENÜ */}
                <nav className="flex flex-col gap-3 flex-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl text-lg transition-all
                                ${location.pathname === item.path
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                                }
                            `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* ÇIKIŞ */}
                <div className="pt-6 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </div>

            {/* SAĞ İÇERİK */}
            <div className="flex-1 p-10 overflow-y-auto bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a]">
                {children}
            </div>
        </div>
    );
};

export default ClubManagerLayout;
