import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
    children: React.ReactNode;
    handleLogout?: () => void;
}

const ClubManagerLayout: React.FC<LayoutProps> = ({ children, handleLogout }) => {
    const location = useLocation();

    const menuItems = [
        { name: "Yeni Etkinlik Oluştur", path: "/club/create-event", icon: "➕" },
        { name: "Etkinlikler", path: "/club/events", icon: "📅" },
        { name: "Duyurular", path: "/club/announcements", icon: "📢" },
        { name: "Kulüp Üyeleri", path: "/club/members", icon: "👥" },
        { name: "Ayarlar", path: "/club/settings", icon: "⚙️" },
    ];

    return (
        <div className="min-h-screen flex bg-[#0a0f2d] text-white">

            {/* SOL MENÜ */}
            <div className="w-72 bg-[#0d102e] border-r border-white/10 flex flex-col p-6">

                {/* LOGO */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
                        ✔️
                    </div>
                    <h1 className="text-2xl font-bold mt-4 text-center">
                        Uni2Clup <br /> Kulüp Yönetimi
                    </h1>
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
                <button
                    onClick={handleLogout}
                    className="mt-6 w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition-all"
                >
                    Çıkış Yap
                </button>
            </div>

            {/* SAĞ İÇERİK */}
            <div className="flex-1 p-10 overflow-y-auto bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a]">
                {children}
            </div>
        </div>
    );
};

export default ClubManagerLayout;
