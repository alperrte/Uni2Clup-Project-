﻿import React, { useState, useEffect } from "react";

interface LoginPageProps {
    onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/Auth/login`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({
                    email: email,
                    passwordHash: password,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setSuccessMessage(data.message || "Giriş başarılı!");
                setShowSuccessModal(true);

                // 2 saniye sonra modal'ı kapat ve callback'i çağır
                setTimeout(() => {
                    setShowSuccessModal(false);
                    onLoginSuccess?.();
                }, 2000);
            } else {
                const errorText = await res.text();
                console.error("Login hata:", errorText);
                alert("❌ Hatalı e-posta veya şifre.");
            }
        } catch (error) {
            console.error("Sunucu bağlantı hatası:", error);
            alert("🚫 Sunucuya bağlanılamadı. Backend (8080) çalışıyor mu?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex items-center justify-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-15 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#1e3a8a] to-[#2d1b69] rounded-full opacity-10 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#2d1b69] to-[#1e3a8a] rounded-full opacity-8 animate-pulse delay-500"></div>
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

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-bounce">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-28 h-28 border-2 border-[#3b82f6] rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                    </div>

                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent animate-pulse">
                        Hoş Geldin!
                    </h1>

                    <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center transform rotate-12">
                                <span className="text-white font-bold text-sm">2</span>
                            </div>
                            <span className="text-3xl font-bold bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent">
                                Uni2Club
                            </span>
                        </div>
                    </div>

                    {/* Anket Sistemi Badge */}
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#1a1a3a] to-[#2a2a4a] border border-[#3b82f6] rounded-full px-4 py-2 mb-4">
                        <svg className="w-5 h-5 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-300">Etkinlik Sistemi</span>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Input */}
                    <div className="group">
                        <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                            <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="E-posta adresi"
                                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="group">
                        <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                            <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Şifre"
                                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="w-6 h-6 text-gray-400 hover:text-[#3b82f6] transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <svg fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                                        </svg>
                                    ) : (
                                        <svg fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:from-[#4a2a8a] hover:to-[#4f94f6] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse"></div>
                        <div className="relative flex items-center justify-center space-x-2">
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Giriş yapılıyor...</span>
                                </>
                            ) : (
                                <>
                                    <span>Giriş Yap</span>
                                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                    </svg>
                                </>
                            )}
                        </div>
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-400 text-sm">
                        Güvenli giriş için bilgilerinizi doğru girin
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-2xl p-8 mx-4 max-w-md w-full transform animate-bounceIn shadow-2xl">
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            {/* Success Message */}
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Giriş Başarılı!
                            </h3>

                            <p className="text-gray-300 mb-6">
                                {successMessage}
                            </p>

                            {/* Anket Sistemi Info */}
                            <div className="bg-gradient-to-r from-[#0f0f1a] to-[#1a1a2e] border border-[#3b82f6] rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <svg className="w-5 h-5 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-[#3b82f6]">Uni2Club Etkinlik Sistemi</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Artık etkinliklere ve kulüplere katılabilir, görüşlerinizi paylaşabilir ve topluluk oylamalarına dahil olabilirsiniz!
                                </p>
                            </div>

                            {/* Loading Bar */}
                            <div className="w-full bg-[#0f0f1a] rounded-full h-2 mb-4">
                                <div className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] h-2 rounded-full animate-pulse"></div>
                            </div>

                            <p className="text-xs text-gray-500">
                                Yönlendiriliyorsunuz...
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage; 