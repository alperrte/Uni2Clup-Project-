// App.tsx (TSX UYUMLU VE HATASIZ)
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// TSX component importları
import LoginPage from "./pages/LoginPage";
import EventPage from "./pages/EventPage";
import AdminLayout from "./components/AdminLayout";
import AddUserPage from "./pages/AddUserPage";
import UserListPage from "./pages/UserListPage";
import StudentApplicationsPage from "./pages/StudentApplicationsPage";
import ClubManagementPage from "./pages/ClubManagementPage";

interface UserData {
    name: string;
    role: string;
    token: string;
}

const translateRole = (role: string): string => {
    switch (role) {
        case "Admin":
            return "Yönetici";
        case "Student":
            return "Öğrenci";
        case "Academic":
            return "Akademisyen";
        case "ClubManager":
            return "Kulüp Yöneticisi";
        default:
            return role;
    }
};

const App: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");
        const name = localStorage.getItem("userName");

        if (token && role && name) {
            setUser({ name, role, token });
        } else {
            localStorage.clear();
        }
    }, []);

    const handleLoginSuccess = (userData: UserData) => {
        if (!userData?.role || !userData?.name || !userData?.token) return;

        localStorage.setItem("token", userData.token);
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userName", userData.name);

        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
    };

    if (!user) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    // ---- ADMIN ROUTES ----
    const AdminRoutes: React.FC = () => (
        <AdminLayout handleLogout={handleLogout}>
            <Routes>
                {/* Varsayılan admin sayfası */}
                <Route index element={<Navigate to="add-user" replace />} />

                {/* Kullanıcı ekleme */}
                <Route path="add-user" element={<AddUserPage />} />

                {/* Yeni eklenen ROUTELAR */}
                <Route path="users" element={<UserListPage />} />
                <Route path="applications" element={<StudentApplicationsPage />} />
                <Route path="clubs" element={<ClubManagementPage />} />

                {/* Dinamik kullanıcı listeleri */}
                <Route path="students" element={<UserListPage targetRole="Student" />} />
                <Route path="academics" element={<UserListPage targetRole="Academic" />} />
                <Route path="club-managers" element={<UserListPage targetRole="ClubManager" />} />
                <Route path="admins" element={<UserListPage targetRole="Admin" />} />

                {/* Hatalı URL → add-user */}
                <Route path="*" element={<Navigate to="add-user" replace />} />
            </Routes>
        </AdminLayout>
    );

    return (
        <Router>
            <Routes>
                {/* Admin */}
                {user.role === "Admin" && (
                    <>
                        <Route path="/admin/*" element={<AdminRoutes />} />
                        <Route path="/" element={<Navigate to="/admin" replace />} />
                    </>
                )}

                {/* Club Manager */}
                {user.role === "ClubManager" && (
                    <Route path="*" element={<EventPage handleLogout={handleLogout} />} />
                )}

                {/* Student & Academic */}
                {(user.role === "Student" || user.role === "Academic") && (
                    <Route
                        path="*"
                        element={
                            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
                                <h1 className="text-4xl font-bold mb-4">
                                    👋 Hoş geldin {user.name}!
                                </h1>
                                <p className="text-lg mb-2">
                                    Şu anda <strong>{translateRole(user.role)}</strong> rolündesin.
                                </p>
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                                >
                                    Çıkış Yap
                                </button>
                            </div>
                        }
                    />
                )}

                {/* Hiçbir rota uymuyorsa yönlendir */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
