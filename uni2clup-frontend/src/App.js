// App.js (DÜZELTİLMİŞ VE KESİNLEŞTİRİLMİŞ)
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// TSX Bileşenlerinizi import ediyoruz
import LoginPage from "./pages/LoginPage";
import EventPage from "./pages/EventPage";
import AdminLayout from "./components/AdminLayout";
import AddUserPage from "./pages/AddUserPage";
import UserListPage from "./pages/UserListPage";

const translateRole = (role) => {
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

function App() {
    const [user, setUser] = useState(null);

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

    const handleLoginSuccess = (userData) => {
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

    // Admin Rotalarını tanımla (Layout içinde)
    const AdminRoutes = () => (
        <AdminLayout handleLogout={handleLogout}>
            {/* AdminLayout'un içindeki rotaların kök dizini ("/admin") olarak kabul edilmesi için Routes'u kullanıyoruz */}
            <Routes>
                {/* 1. Varsayılan Sayfa: /admin'e veya /admin/'e gelenleri Kullanıcı Ekle sayfasına yönlendir */}
                <Route index element={<Navigate to="add-user" replace />} /> {/* /admin/ için */}
                <Route path="add-user" element={<AddUserPage />} />

                {/* 2. Dinamik Kullanıcı Listesi Rotaları */}
                <Route path="students" element={<UserListPage targetRole="Student" />} />
                <Route path="academics" element={<UserListPage targetRole="Academic" />} />
                <Route path="club-managers" element={<UserListPage targetRole="ClubManager" />} />
                <Route path="admins" element={<UserListPage targetRole="Admin" />} />

                {/* 3. Yanlış URL girilirse geri yönlendir */}
                <Route path="*" element={<Navigate to="add-user" replace />} />
            </Routes>
        </AdminLayout>
    );

    // Ana uygulama render yapısı
    return (
        <Router>
            <Routes>
                {/* Admin Rolü Ana Rotası */}
                {user.role === "Admin" && (
                    // path="/admin/*" tanımı, tüm alt rotaları AdminRoutes bileşenine yönlendirir.
                    <Route path="/admin/*" element={<AdminRoutes />} />
                )}

                {/* Eğer Admin giriş yaptıysa ve kök dizine (/) gelirse, /admin'e yönlendir */}
                {user.role === "Admin" && (
                    <Route path="/" element={<Navigate to="/admin" replace />} />
                )}

                {/* ClubManager Rolü İçin Rota */}
                {user.role === "ClubManager" && (
                    <Route path="*" element={<EventPage handleLogout={handleLogout} />} />
                )}

                {/* Diğer Roller (Student, Academic) İçin Default Sayfa */}
                {(user.role === "Student" || user.role === "Academic") && (
                    <Route path="*" element={
                        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
                            <h1 className="text-4xl font-bold mb-4">👋 Hoş geldin {user.name}!</h1>
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
                    } />
                )}

                {/* Eğer kullanıcı giriş yaptıysa ve hiçbir rotaya uymuyorsa, anasayfaya yönlendir (Bu satır genellikle login ekranına düşmeyi engeller) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;