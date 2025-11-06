import React, { useState } from "react";

const API_URL = "http://localhost:8080";

const AddUserPage: React.FC = () => {
    const [form, setForm] = useState({
        name: "",
        surname: "",
        password: "",
        role: "Student",
    });
    const [response, setResponse] = useState<{ message?: string; email?: string; password?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const token = localStorage.getItem("token")?.trim() || "";

    // Form input değişikliği
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ✅ Kullanıcı oluşturma
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);

        if (!token) {
            alert("🔒 Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            window.location.reload();
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/Auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.status === 401) {
                alert("🚫 Token geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            const data = await res.json();

            if (res.ok) {
                setResponse({
                    message: "✅ Kullanıcı başarıyla oluşturuldu!",
                    email: data.email,
                    password: data.password,
                });
                setShowSuccessModal(true);
                setForm({ name: "", surname: "", password: "", role: "Student" });
                setTimeout(() => {
                    setShowSuccessModal(false);
                    setResponse(null);
                }, 3000);
            } else {
                setResponse({
                    message: data.message || "❌ Kullanıcı oluşturulamadı.",
                });
            }
        } catch (err) {
            console.error("🚫 Sunucu hatası:", err);
            setResponse({ message: "❌ Sunucuya bağlanılamadı. Backend (8080) açık mı?" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white flex items-center justify-center py-10 px-4 relative overflow-hidden">
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

            <div className="relative z-10 w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-bounce">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-28 h-28 border-2 border-[#3b82f6] rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                    </div>

                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] bg-clip-text text-transparent animate-pulse">
                        Yeni Kullanıcı Oluştur
                    </h1>
                </div>

                {/* Form */}
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                    <div className="bg-[#0f0f1a] rounded-lg p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <div className="group">
                                <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                                    <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                        <input
                                            name="name"
                                            placeholder="İsim"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Surname Input */}
                            <div className="group">
                                <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                                    <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                        <input
                                            name="surname"
                                            placeholder="Soyisim"
                                            value={form.surname}
                                            onChange={handleChange}
                                            required
                                            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
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
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Şifre"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
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

                            {/* Role Select */}
                            <div className="group">
                                <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                                    <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                        </div>
                                        <select
                                            name="role"
                                            value={form.role}
                                            onChange={handleChange}
                                            className="flex-1 bg-transparent text-white outline-none text-lg cursor-pointer"
                                        >
                                            <option value="Student" className="bg-[#0f0f1a]">Öğrenci</option>
                                            <option value="Academic" className="bg-[#0f0f1a]">Akademisyen</option>
                                            <option value="ClubManager" className="bg-[#0f0f1a]">Kulüp Yöneticisi</option>
                                            <option value="Admin" className="bg-[#0f0f1a]">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:from-[#4a2a8a] hover:to-[#4f94f6] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse"></div>
                                <div className="relative flex items-center justify-center space-x-2">
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Kaydediliyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Kullanıcı Oluştur</span>
                                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>

                        {/* Response Message */}
                        {response && !showSuccessModal && (
                            <div className={`mt-6 p-4 rounded-lg shadow-inner border ${response.message?.startsWith("✅")
                                    ? "bg-green-900/30 border-green-700 text-green-200"
                                    : "bg-red-900/30 border-red-700 text-red-200"
                                }`}>
                                <p className="font-semibold mb-2">{response.message}</p>
                                {response.email && (
                                    <p className="text-sm">
                                        📧 <strong className="font-bold">E-posta:</strong> {response.email}
                                    </p>
                                )}
                                {response.password && (
                                    <p className="text-sm">
                                        🔑 <strong className="font-bold">Geçici Şifre:</strong> {response.password}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Success Modal */}
            {showSuccessModal && response && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] border border-[#3b82f6] rounded-2xl p-8 mx-4 max-w-md w-full transform animate-bounceIn shadow-2xl">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Kullanıcı Oluşturuldu!</h3>
                            <p className="text-gray-300 mb-4">{response.message}</p>
                            {response.email && (
                                <div className="bg-gradient-to-r from-[#0f0f1a] to-[#1a1a2e] border border-[#3b82f6] rounded-lg p-4 mb-4">
                                    <p className="text-sm text-gray-400 mb-1">📧 E-posta:</p>
                                    <p className="text-lg font-semibold text-[#3b82f6]">{response.email}</p>
                                </div>
                            )}
                            {response.password && (
                                <div className="bg-gradient-to-r from-[#0f0f1a] to-[#1a1a2e] border border-[#3b82f6] rounded-lg p-4 mb-4">
                                    <p className="text-sm text-gray-400 mb-1">🔑 Geçici Şifre:</p>
                                    <p className="text-lg font-semibold text-[#3b82f6]">{response.password}</p>
                                </div>
                            )}
                            <div className="w-full bg-[#0f0f1a] rounded-full h-2 mt-4">
                                <div className="bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] h-2 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddUserPage;
