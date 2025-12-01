// App.tsx — Final ve StudentLayout dahil edilen sürüm
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Login
import LoginPage from "./pages/LoginPage";

// Admin
import AdminLayout from "./components/AdminLayout";
import AddUserPage from "./pages/AdminPages/AddUserPage";
import UserListPage from "./pages/AdminPages/UserListPage";
import StudentApplicationsPage from "./pages/AdminPages/StudentApplicationsPage";
import ClubManagementPage from "./pages/AdminPages/ClubManagementPage";

// Club Manager
import ClubManagerRoutes from "./pages/ClubManagerRoutes";
import CreateAnnouncementPage from "./pages/CreateAnnouncementPage";

// 🟦 Student Paneli
import StudentLayout from "./components/StudentLayout";

//Password 
import ForgotPassword from "./password/ForgotPassword";
import ResetPassword from "./password/ResetPassword";
import ChangePassword from "./password/ChangePassword";

interface UserData {
    name: string;
    role: string;
    token: string;
}

const translateRole = (role: string) => {
    switch (role) {
        case "Admin": return "Yönetici";
        case "Student": return "Öğrenci";
        case "Academic": return "Akademisyen";
        case "ClubManager": return "Kulüp Yöneticisi";
        default: return role;
    }
};

const App: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);

    // Uygulama açıldığında localStorage kontrolü
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");
        const name = localStorage.getItem("userName");

        if (token && role && name) {
            setUser({ name, role, token });
        }
    }, []);

    const handleLoginSuccess = (userData: UserData) => {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userName", userData.name);

        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
    };

    // ---- ADMIN ROUTES ----
    const AdminRoutes = () => (
        <AdminLayout handleLogout={handleLogout}>
            <Routes>
                <Route index element={<Navigate to="add-user" replace />} />

                <Route path="add-user" element={<AddUserPage />} />

                {/* Kullanıcı türleri */}
                <Route path="students" element={<UserListPage targetRole="Student" />} />
                <Route path="academics" element={<UserListPage targetRole="Academic" />} />
                <Route path="club-managers" element={<UserListPage targetRole="ClubManager" />} />
                <Route path="admins" element={<UserListPage targetRole="Admin" />} />

                <Route path="applications" element={<StudentApplicationsPage />} />
                <Route path="clubs" element={<ClubManagementPage />} />

                <Route path="*" element={<Navigate to="add-user" replace />} />



            </Routes>
        </AdminLayout>
    );

    return (
        <Router>
            <Routes>

                {/* 🟦 LOGIN her zaman Router içinde */}
                <Route
                    path="/"
                    element={
                        user
                            ? <Navigate to={`/${user.role.toLowerCase()}`} replace />
                            : <LoginPage onLoginSuccess={handleLoginSuccess} />
                    }
                />

                {/* Şifremi unuttum → herkese açık */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* 🟥 ADMIN */}
                {user?.role === "Admin" && (
                    <Route path="/admin/*" element={<AdminRoutes />} />
                )}

                {/* 🟪 CLUB MANAGER */}
                {user?.role === "ClubManager" && (
                    <>
                        <Route
                            path="/club/*"
                            element={<ClubManagerRoutes handleLogout={handleLogout} />}
                        />
                        <Route
                            path="/club/create-announcement"
                            element={<CreateAnnouncementPage />}
                        />
                        <Route path="*" element={<Navigate to="/club" replace />} />
                    </>
                )}

                {/* 🟦 STUDENT & ACADEMIC */}
                {(user?.role === "Student" || user?.role === "Academic") && (
                    <>
                        {/* ⭐ StudentLayout burada */}
                        <Route path="/student/*" element={<StudentLayout />} />
                        <Route path="/academic/*" element={<StudentLayout />} />

                        <Route path="*" element={<Navigate to="/student" replace />} />
                    </>
                )}

                {/* Hatalı rota */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </Router>
    );
};

export default App;
