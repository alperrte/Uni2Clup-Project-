import React, { useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import EventPage from "./pages/EventPage";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLoginSuccess = () => {
        console.log("✅ App.js: Kullanıcı girişi başarılı — EventPage'e geçiliyor");
        setIsLoggedIn(true);
    };

    return (
        <div className="App">
            {!isLoggedIn ? (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
                <EventPage />
            )}
        </div>
    );
}

export default App;
