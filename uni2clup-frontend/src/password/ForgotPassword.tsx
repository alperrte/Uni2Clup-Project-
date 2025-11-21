import React, { useState } from "react";

const API_URL = "http://localhost:8080";

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

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
            alert(data.message);
        } catch {
            alert("Sunucu hatası!");
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
                    className="mt-4 w-full bg-[#3b82f6] hover:bg-[#4f94f6] text-white py-3 rounded-lg"
                >
                    {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
