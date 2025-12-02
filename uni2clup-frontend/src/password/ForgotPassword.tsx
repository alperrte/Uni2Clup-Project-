import React, { useState } from "react";

const API_URL = "http://localhost:8080";

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [modal, setModal] = useState<{
        type: "success" | "error" | "";
        message: string;
    }>({ type: "", message: "" });

    const closeModal = () => setModal({ type: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/Auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setModal({
                    type: "error",
                    message: data.message || "Bir hata oluştu.",
                });
            } else {
                setModal({
                    type: "success",
                    message: data.message,
                });
            }
        } catch {
            setModal({
                type: "error",
                message: "Sunucu hatası!",
            });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-[#1a1a2e] p-8 rounded-xl w-full max-w-md border border-[#3b82f6]"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Şifre Sıfırlama</h2>

                <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    className="w-full p-3 rounded-lg bg-[#0f0f1a] border border-[#3b82f6] text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-[#3b82f6] hover:bg-[#4f94f6] text-white py-3 rounded-lg transition-all"
                >
                    {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
                </button>
            </form>

            {/* 🌟 MODAL */}
            {modal.type !== "" && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div
                        className={`p-8 rounded-xl w-full max-w-sm shadow-xl
                        ${modal.type === "success"
                                ? "bg-[#1a1a2e] border border-green-500"
                                : "bg-[#1a1a2e] border border-red-500"
                            }`}
                    >
                        <h2
                            className={`text-xl font-bold mb-4 text-center 
                            ${modal.type === "success" ? "text-green-400" : "text-red-400"}`}
                        >
                            {modal.type === "success" ? "✔ Başarılı" : "❌ Hata"}
                        </h2>

                        <p className="text-gray-300 text-center mb-6">
                            {modal.message}
                        </p>

                        <button
                            onClick={closeModal}
                            className={`w-full py-3 rounded-lg
                                ${modal.type === "success"
                                    ? "bg-green-600"
                                    : "bg-red-600"} text-white`}
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;
