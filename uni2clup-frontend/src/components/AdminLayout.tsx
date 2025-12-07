import React from "react";
import { Link, useLocation } from "react-router-dom";



interface AdminLayoutProps {
    children: React.ReactNode;
    handleLogout: () => void;
}

const navItems = [
    { name: "Kullanıcı Ekle", path: "/admin/add-user", role: "Admin", icon: "➕" },
    { name: "Öğrenciler", path: "/admin/students", role: "Student", icon: "👨‍🎓" },
    { name: "Kulüp Yöneticileri", path: "/admin/club-managers", role: "ClubManager", icon: "👔" },
    { name: "Yöneticiler", path: "/admin/admins", role: "Admin", icon: "👑" },
    { name: "Öğrenci Başvuruları", path: "/admin/applications", role: "Admin", icon: "📩" },
    { name: "Kulüp Yönetimi", path: "/admin/clubs", role: "Admin", icon: "🏛️" },
];



const AdminLayout: React.FC<AdminLayoutProps> = ({ children, handleLogout }) => {
    const location = useLocation();

    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [confirmMessage, setConfirmMessage] = React.useState("");
    const [confirmAction, setConfirmAction] = React.useState<(() => void) | null>(null);


    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex relative overflow-hidden">
            {/* Animasyonlu Arka Plan */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-15 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#1e3a8a] to-[#2d1b69] rounded-full opacity-10 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/32 w-64 h-64 bg-gradient-to-r from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-8 animate-pulse delay-500"></div>
            </div>

            {/* Efektler */}  
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
            <div className="fixed left-0 top-0 h-full w-90 border-r-2 border-[#3b82f6] bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] flex flex-col p-6 shadow-2xl z-50">

                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <img
                        src="/yönetim_paneli_logosu.png"
                        alt="U2C Admin Logo"
                        className="w-32 h-32 object-contain"
                    />

                    <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent leading-[1.2]">
                        Uni2Clup Yönetim Paneli
                    </h1>
                </div>

                {/* NAV Menü */}
                <nav className="space-y-5 flex flex-col">

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
                                <span
                                    className={`font-semibold text-lg ${location.pathname === item.path
                                            ? "text-white"
                                            : "text-gray-300 group-hover:text-white"
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </div>

                            {location.pathname === item.path && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 rounded-xl animate-pulse"></div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Çıkış Yap Butonu */}
                <button
                    onClick={() => {
                        setConfirmMessage("Yönetim Panelinden çıkış yapmak istediğinize emin misiniz?");
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


            {/* Main Content */}
            <main className="ml-80 flex-1 overflow-y-auto relative z-10">
                <div className="p-8">{children}</div>
            </main>

        </div>
    );
};

export default AdminLayout;
