// components/AdminLayout.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface AdminLayoutProps {
    children: React.ReactNode;
    handleLogout: () => void;
}

const navItems = [
    { name: "Kullanıcı Ekle", path: "/admin/add-user", role: "Admin" },
    { name: "Öğrenciler", path: "/admin/students", role: "Student" },
    { name: "Akademisyenler", path: "/admin/academics", role: "Academic" },
    { name: "Kulüp Yöneticileri", path: "/admin/club-managers", role: "ClubManager" },
    { name: "Adminler", path: "/admin/admins", role: "Admin" },
    // Gerekirse diğer menü öğeleri buraya eklenebilir.
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, handleLogout }) => {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 flex flex-col p-4 shadow-xl">
                <div className="text-2xl font-bold mb-8 text-indigo-400">Uni2Club Admin</div>
                <nav className="flex-grow">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block p-3 my-1 rounded-lg transition-colors duration-200 ${location.pathname === item.path
                                    ? "bg-indigo-600 font-semibold shadow-md"
                                    : "hover:bg-gray-700"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="pt-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left p-3 my-1 rounded-lg text-red-400 hover:bg-gray-700 transition-colors duration-200"
                    >
                        <span role="img" aria-label="çıkış">🚪</span> Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;