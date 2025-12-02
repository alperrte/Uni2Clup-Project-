import React from "react";
import { useNavigate } from "react-router-dom";

const StatusPage: React.FC = () => {
    const navigate = useNavigate();

    const goToLogin = () => {
        localStorage.clear();      
        navigate("/", { replace: true });  
    };

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] flex items-center justify-center text-white overflow-hidden">

            {/* Arka Plan Efektleri */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-900 to-red-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-red-800 to-red-500 rounded-full opacity-10 blur-3xl animate-pulse delay-700"></div>

            {/* Kart */}
            <div className="relative z-10 max-w-md w-full text-center bg-[#1a1a2e] border border-red-700/50 p-10 rounded-2xl shadow-2xl">

                {/* Yanıp Sönen Uyarı İkonu */}
                <div className="relative mx-auto mb-6 flex items-center justify-center">
                    <div className="relative">
                        <div className="w-28 h-28 bg-gradient-to-br from-red-800 to-red-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                            <svg
                                className="w-14 h-14 text-white animate-bounce"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>

                        <div className="absolute inset-0 rounded-full bg-red-600 opacity-20 blur-xl animate-ping"></div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-red-400 mb-4">
                    Üyeliğiniz Askıya Alındı
                </h1>

                <p className="text-gray-300 text-lg mb-3 leading-relaxed">
                    Hesabınız yöneticiler tarafından pasif duruma getirildi.
                </p>

                <p className="text-gray-400 mb-8">
                    Lütfen sistem yöneticileri ile iletişime geçiniz.
                </p>

                {/* Giriş Sayfasına Dön */}
                <button
                    onClick={goToLogin}
                    className="w-full bg-red-700 hover:bg-red-800 py-3 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                    ← Giriş Sayfasına Dön
                </button>
            </div>
        </div>
    );
};

export default StatusPage;
