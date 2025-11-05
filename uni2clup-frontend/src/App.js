import React, { useState, useEffect } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import EventPage from "./pages/EventPage";
import AddUserPage from "./pages/AddUserPage";

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
        if (!userData?.role || !userData?.name) return;

        localStorage.setItem("token", userData.token);
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userName", userData.name);

        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
    };

    if (!user) return <LoginPage onLoginSuccess={handleLoginSuccess} />;

    switch (user.role) {
        case "Admin":
            return (
                <div>
                    <button
                        onClick={handleLogout}
                        className="absolute top-4 right-4 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Çıkış Yap
                    </button>
                    <AddUserPage />
                </div>
            );

        case "ClubManager":
            return (
                <div>
                    <button
                        onClick={handleLogout}
                        className="absolute top-4 right-4 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Çıkış Yap
                    </button>
                    <EventPage />
                </div>
            );

        default:
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
                    <h1 className="text-4xl font-bold mb-4">👋 Hoş geldin {user.name}!</h1>
                    <p className="text-lg mb-2">
                        Şu anda <strong>{user.role}</strong> rolündesin.
                    </p>
                    <p className="text-gray-300 mb-4">
                        Bu rol için özel panel yakında eklenecek.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                    >
                        Çıkış Yap
                    </button>
                </div>
            );
    }
}

export default App;
