import React, { useState } from "react";

interface LoginPageProps {
    onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/api/Auth/login`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({
                    email: email,           // ✅ küçük harf (backend DTO ile tam uyumlu)
                    passwordHash: password, // ✅ küçük harf
                }),
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                onLoginSuccess?.();
            } else {
                const errorText = await res.text();
                console.error("Login hata:", errorText);
                alert("❌ Hatalı e-posta veya şifre.");
            }
        } catch (error) {
            console.error("Sunucu bağlantı hatası:", error);
            alert("🚫 Sunucuya bağlanılamadı. Backend (8080) çalışıyor mu?");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white">
            <form
                onSubmit={handleLogin}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl w-96 shadow-lg"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Uni2Clup Giriş Paneli
                </h1>

                <input
                    type="email"
                    placeholder="E-posta"
                    className="w-full mb-4 p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Şifre"
                    className="w-full mb-6 p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
                >
                    Giriş Yap
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
