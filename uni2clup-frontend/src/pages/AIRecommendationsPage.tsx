import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080";

const AIRecommendationsPage = () => {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(""); // 🔥 Toast mesajı
    const navigate = useNavigate();

    const fetchRecommendations = () => {
        setLoading(true);

        const token = localStorage.getItem("token");

        fetch(`${API_URL}/api/AI/recommend-clubs`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((data) => {
                setRecommendations(data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Bir hata oluştu: " + err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000); // 3 saniyede kaybolur
    };

    const joinClub = (clubId) => {
        const token = localStorage.getItem("token");

        fetch(`${API_URL}/api/studentpanel/clubs/${clubId}/join`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                showToast("Kulübe başarıyla katıldınız! 🎉");
            })
            .catch((err) => {
                showToast("Hata: " + err.message);
            });
    };

    // 🟣 LOADING
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white">

                <img
                    src="/Copilot_20251129_235210.png"
                    alt="Loading Logo"
                    className="w-32 h-32 mb-6 animate-pulse drop-shadow-xl"
                />

                <h1 className="text-4xl font-bold mb-3 tracking-wide">
                    🤖 Yapay Zeka Analiz Ediyor...
                </h1>

                <p className="text-gray-300 text-lg animate-pulse">
                    Senin için en uygun kulüpler hesaplanıyor ✨
                </p>
            </div>
        );
    }

    // ❌ ERROR
    if (error) {
        return <div className="min-h-screen bg-[#0a0a1a] text-red-500 p-10 text-center">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a1a3a] text-white relative">

            {/* 🔙 Geri Butonu */}
            <button
                onClick={() => navigate("/student")}
                className="absolute top-6 left-6 px-4 py-2 rounded-lg bg-[#1d1d2d] border border-[#3b82f6]/40 hover:bg-[#2d2d3d] transition"
            >
                ◀ Geri
            </button>

            {/* 🔄 Yenile Butonu */}
            <button
                onClick={fetchRecommendations}
                className="absolute top-6 right-6 px-4 py-2 rounded-lg bg-[#1d1d2d] border border-[#3b82f6]/40 hover:bg-[#2d2d3d] transition"
            >
                🔄 Yenile
            </button>

            {/* 🌟 Toast Mesajı */}
            {toast && (
                <div className="fixed top-5 right-5 bg-purple-700 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in">
                    {toast}
                </div>
            )}

            {/* İÇERİK */}
            <div className="max-w-5xl mx-auto py-20 px-6 space-y-10">

                <div className="bg-gradient-to-br from-[#1c1f44] to-[#111326] border border-[#3b82f6]/40 rounded-3xl p-10 shadow-2xl">
                    <p className="text-sm uppercase tracking-[0.4em] text-[#93c5fd]">
                        Yapay Zeka Öneri Sistemi
                    </p>

                    <h1 className="text-4xl font-extrabold mt-2">
                        Senin İçin Hazırlanan Kulüp Önerileri 🎉
                    </h1>

                    <p className="text-gray-300 mt-3 max-w-2xl">
                        İlgi alanların ve aktivitelerin incelenerek sana özel hazırlanmış kulüp önerileri!
                    </p>
                </div>

                {/* Kartlar */}
                <div className="space-y-8">
                    {recommendations.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-3xl border border-purple-500/40 bg-[#0f0f1a]/70 p-10 shadow-xl hover:shadow-purple-700/30 transition"
                        >
                            <h2 className="text-3xl font-bold text-purple-300">
                                {item.club?.name}
                            </h2>

                            <p className="text-gray-400 text-lg mt-1">
                                {item.club?.department?.name}
                            </p>

                            <p className="mt-3 text-gray-300">{item.club?.description}</p>

                            <button
                                onClick={() => joinClub(item.club.id)}
                                className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 
                               text-white font-bold rounded-xl shadow-lg transition"
                            >
                                Kulübe Katıl
                            </button>

                            <div className="mt-6 bg-[#1e1b3a]/60 border border-purple-600 p-5 rounded-2xl shadow-lg relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>

                                <p className="text-purple-200 text-lg">
                                    <span className="text-[#ffd700] font-bold">
                                        "{item.related_to}"
                                    </span>{" "}
                                    üyeliğinize göre bu kulüp öneriliyor çünkü{" "}
                                    <span className="text-white italic">{item.reason}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* TOAST ANİMASYONU */}
            <style>
                {`
                .animate-slide-in {
                    animation: slideIn 0.4s ease-out;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                `}
            </style>
        </div>
    );
};

export default AIRecommendationsPage;
