import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080";

const PasswordInput = ({
    value,
    onChange,
    placeholder,
    show,
    setShow,
}) => {
    return (
        <div className="relative mb-3">
            <input
                type={show ? "text" : "password"}
                className="w-full p-3 rounded-lg bg-[#0f0f1a] border border-[#3b82f6] text-white pr-10 outline-none"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
            >
                {show ? (
                    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 
                        7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 
                        12c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 
                        7.5s4.5 2.02 4.5 4.5S14.48 16.5 12 16.5z"/>
                    </svg>
                ) : (
                    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 
                        12c-2.76 0-5-2.24-5-5s2.24-5 
                        5-5 5 2.24 5 5-2.24 5-5 
                        5z"/>
                    </svg>
                )}
            </button>
        </div>
    );
};

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showNew2, setShowNew2] = useState(false);

    const email = localStorage.getItem("tempEmail");


    const [modal, setModal] = useState<{
        type: "success" | "error" | "";
        message: string;
    }>({ type: "", message: "" });

    const closeModal = () => setModal({ type: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setModal({
                type: "error",
                message: "Geçici email bulunamadı. Lütfen tekrar giriş yapın."
            });
            return;
        }

        if (newPassword !== newPassword2) {
            setModal({
                type: "error",
                message: "Yeni şifreler eşleşmiyor!"
            });
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/Auth/first-login-change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    temporaryPassword: oldPassword,
                    newPassword: newPassword
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setModal({ type: "error", message: data.message || "Bir hata oluştu." });
                return;
            }

            setModal({ type: "success", message: data.message });

            setTimeout(() => {
                localStorage.removeItem("tempEmail");
                navigate("/");
            }, 2500);

        } catch {
            setModal({
                type: "error",
                message: "Sunucu hatası!"
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-[#1a1a2e] p-8 rounded-xl w-full max-w-md border border-[#3b82f6]"
            >
                <h2 className="text-3xl font-bold mb-6 text-center">
                    Yeni Şifre Belirle
                </h2>

                <PasswordInput
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Geçici şifre"
                    show={showOld}
                    setShow={setShowOld}
                />

                <PasswordInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni şifre"
                    show={showNew}
                    setShow={setShowNew}
                />

                <PasswordInput
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    placeholder="Yeni şifre (tekrar)"
                    show={showNew2}
                    setShow={setShowNew2}
                />

                <button
                    type="submit"
                    className="mt-4 w-full bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:scale-[1.02] transition-all text-white font-bold py-3 rounded-lg"
                >
                    Şifreyi Kaydet
                </button>
            </form>

            {/* MODAL */}
            {modal.type !== "" && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className={`p-8 rounded-xl w-full max-w-sm shadow-xl
                        ${modal.type === "success"
                            ? "bg-[#1a1a2e] border border-green-500"
                            : "bg-[#1a1a2e] border border-red-500"}`}
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

export default ChangePassword;
