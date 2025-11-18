import React from "react";
import { Link, useLocation } from "react-router-dom";

interface AdminLayoutProps {
    children: React.ReactNode;
    handleLogout: () => void;
}

const navItems = [
    { name: "Kullanıcı Ekle", path: "/admin/add-user", role: "Admin", icon: "➕" },
    { name: "Öğrenciler", path: "/admin/students", role: "Student", icon: "👨‍🎓" },
    { name: "Akademisyenler", path: "/admin/academics", role: "Academic", icon: "👨‍🏫" },
    { name: "Kulüp Yöneticileri", path: "/admin/club-managers", role: "ClubManager", icon: "👔" },
    { name: "Adminler", path: "/admin/admins", role: "Admin", icon: "👑" },
    { name: "Öğrenci Başvuruları", path: "/admin/applications", role: "Admin", icon: "📩" },
    { name: "Kulüp Yönetimi", path: "/admin/clubs", role: "Admin", icon: "🏛️" },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, handleLogout }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-15 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#1e3a8a] to-[#2d1b69] rounded-full opacity-10 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/32 w-64 h-64 bg-gradient-to-r from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-8 animate-pulse delay-500"></div>
            </div>

            {/* Floating Particles */}  
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

            {/* Sidebar */}
            <div className="relative z-10 w-72   border-r-2 border-[#3b82f6] flex flex-col p-6 shadow-2xl">
                {/* Logo/Header */}
                <div className="mb-10">
                    <div className="relative inline-block mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <div className="absolute -top-1 -right-1 w-20 h-20 border-2 border-[#3b82f6] rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                    </div>
                    <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                        Uni2Clup Admin Paneli
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-grow space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`group relative block p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${location.pathname === item.path
                                    ? "bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] shadow-lg shadow-[#3b82f6]/50"
                                    : "bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] hover:border-[#3b82f6] border-2 border-transparent"
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{item.icon}</span>
                                <span className={`font-semibold text-lg ${location.pathname === item.path
                                        ? "text-white"
                                        : "text-gray-300 group-hover:text-white"
                                    }`}>
                                    {item.name}
                                </span>
                            </div>
                            {location.pathname === item.path && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 rounded-xl animate-pulse"></div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="pt-6 border-t-2 border-[#3b82f6]/30">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-6 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
