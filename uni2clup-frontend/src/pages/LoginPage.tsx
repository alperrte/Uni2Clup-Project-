import React, { useState } from "react";

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showRegisterModal, setShowRegisterModal] = useState(false); // ✅ Yeni state

    const API_URL = "http://localhost:8080"; // ✅ Backend portu sabit

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/Auth/login`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                alert("❌ Hatalı e-posta veya şifre.");
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            const token = data.token;
            const normalizedUser = {
                name: data.name || data.Name || "",
                email: data.email || data.Email || email,
                role: (data.role || data.Role || "User").trim(),
                token: token,
            };

            if (!token || !normalizedUser.role) {
                alert("🚫 Token veya rol alınamadı.");
                setIsLoading(false);
                return;
            }

            localStorage.setItem("token", token);
            localStorage.setItem("userRole", normalizedUser.role);
            localStorage.setItem("userName", normalizedUser.name);

            setSuccessMessage("Giriş başarılı!");
            setShowSuccessModal(true);

            setTimeout(() => {
                setShowSuccessModal(false);
                onLoginSuccess?.(normalizedUser); // ✅ Token ile App.js'e gönder
            }, 1500);
        } catch (error) {
            alert("🚫 Sunucuya bağlanılamadı. Backend (8800) açık mı?");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Öğrenci kayıt formu (modal) işlemi
    const handleRegister = async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const surname = form.surname.value;
        const email = form.email.value;
        const department = form.department.value;

        try {
            const res = await fetch(`${API_URL}/api/Auth/student-apply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, surname, email, department }),
            });

            if (res.ok) {
                alert("🎉 Başvurunuz alınmıştır. Onay sonrası e-posta gönderilecektir.");
                setShowRegisterModal(false);
            } else {
                const err = await res.json();
                alert(err.message || "Kayıt sırasında bir hata oluştu");
            }
        } catch {
            alert("🚫 Sunucuya ulaşılamadı!");
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
                                Uni2Clup
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
                                    placeholder="E-posta Adresi"
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
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
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
                                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" />
                                        </svg>
                                    ) : (
                                        <svg fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
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

                    {/* ✅ Yeni: Kayıt Ol Butonu */}
                    <p className="text-gray-400 text-sm mt-4">
                        Hesabın yok mu?{" "}
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="text-[#3b82f6] hover:underline"
                        >
                            Kayıt Ol
                        </button>
                    </p>
                </div>
            </div>

            {/* ✅ Yeni: Kayıt Ol Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-bounceIn">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">🎓 Öğrenci Kayıt Başvurusu</h2>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <input name="name" placeholder="Ad" className="w-full p-3 rounded-lg bg-[#0f0f1a] border border-[#3b82f6] text-white" required />
                            <input name="surname" placeholder="Soyad" className="w-full p-3 rounded-lg bg-[#0f0f1a] border border-[#3b82f6] text-white" required />
                            <input name="email" type="email" placeholder="E-posta (@dogus.edu.tr)" className="w-full p-3 rounded-lg bg-[#0f0f1a] border border-[#3b82f6] text-white" required />
                            <input name="department" placeholder="Bölüm" className="w-full p-3 rounded-lg bg-[#0f0f1a] border border-[#3b82f6] text-white" required />

                            <button type="submit" className="w-full bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] text-white font-bold py-3 rounded-lg hover:opacity-90">
                                Başvuruyu Gönder
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRegisterModal(false)}
                                className="w-full mt-2 bg-[#222] text-gray-300 py-3 rounded-lg hover:bg-[#333]"
                            >
                                İptal
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ✅ Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-2xl p-8 mx-4 max-w-md w-full transform animate-bounceIn shadow-2xl">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-4">
                                Giriş Başarılı!
                            </h3>

                            <p className="text-gray-300 mb-6">{successMessage}</p>

                            <div className="bg-gradient-to-r from-[#0f0f1a] to-[#1a1a2e] border border-[#3b82f6] rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <svg className="w-5 h-5 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold text-[#3b82f6]">
                                        Uni2Club Etkinlik Sistemi
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Artık etkinliklere ve kulüplere katılabilir, görüşlerinizi paylaşabilir ve topluluk oylamalarına dahil olabilirsiniz!
                                </p>
                            </div>

                            <div className="w-full bg-[#0f0f1a] rounded-full h-2 mb-4">
                                <div className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] h-2 rounded-full animate-pulse"></div>
                            </div>

                            <p className="text-xs text-gray-500">Yönlendiriliyorsunuz...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
