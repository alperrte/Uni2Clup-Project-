import React, { useState} from "react";

const API_URL = "http://localhost:8080";

interface FormState {
    name: string;
    surname: string;
    email: string;
    role: string;
    clubId?: number;
}
interface ApiResponse {
    message?: string;
    email?: string;
}

const AddUserPage: React.FC = () => {
    const [form, setForm] = useState<FormState>({
        name: "",
        surname: "",
        email: "",
        role: "Academic",
    });

    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const token = localStorage.getItem("token")?.trim() || "";

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {

        setLoading(true);

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
                body: JSON.stringify({
                    name: form.name,
                    surname: form.surname,
                    email: form.email,
                    role: form.role,
                    clubId: form.role === "ClubManager" ? form.clubId : null,
                }),
            });

            if (res.status === 401) {
                alert("🚫 Token geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            const data: ApiResponse = await res.json();

            if (res.ok) {
                setResponse({
                    message: "✅ Kullanıcı başarıyla oluşturuldu!",
                    email: data.email,
                });
                setShowSuccessModal(true);

                setForm({
                    name: "",
                    surname: "",
                    email: "",
                    role: "Academic",
                    clubId: undefined,
                });

                setTimeout(() => {
                    setShowSuccessModal(false);
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

        <div className="min-h-screen text-black flex items-center justify-center py-10 px-4 relative">

            <div className="text-center mb-10 mt-[-30px]">   
                <div className="relative inline-block mb-10"> 
                    <div className="w-24 h-24 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6]
                rounded-full flex items-center justify-center mx-auto shadow-2xl">

                        {/* ➕ İkonu */}
                        <svg
                            className="w-14 h-14 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>

                    </div>
                    <div
                        className="absolute -top-2 -right-2 w-28 h-28 border-2 border-[#3b82f6] rounded-full animate-spin"
                        style={{ animationDuration: "8s" }}
                    ></div>
                </div>

                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
           bg-clip-text text-transparent leading-snug mt-[-10px]">
                    Yeni Kullanıcı Oluştur
                </h1>

                <div className="max-w-xl mx-auto rounded-xl p-8 shadow-xl border border-[#3b82f6]/30">

                    <form onSubmit={(e) => { e.preventDefault(); setShowConfirmModal(true); }} className="space-y-6">


                        {/* İsim */}
                        <input
                            name="name"
                            placeholder="Ad"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20"
                        />

                        {/* Soyisim */}
                        <input
                            name="surname"
                            placeholder="Soyad"
                            value={form.surname}
                            onChange={handleChange}
                            required
                            className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20"
                        />

                        {/* Email */}
                        <input
                            name="email"
                            placeholder="E-posta (zorunlu: @dogus.edu.tr)"
                            value={form.email}
                            onChange={handleChange}
                            required
                            pattern=".+@dogus\.edu\.tr$"
                            className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20"
                        />

                        {/* Rol */}
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 cursor-pointer"
                        >
                            <option value="Admin">Yönetici</option>
                        </select>


                        {/* Kullanıcı Oluştur Butonu */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] py-4 rounded-xl font-bold "
                        >
                            {loading ? "Kaydediliyor..." : "Kullanıcı Oluştur"}
                        </button>
                    </form>

                    {/* Hata Mesajı*/}
                    {response && !showSuccessModal && (
                        <div className="mt-6 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">
                            {response.message}
                        </div>
                    )}
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
                    <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-[#3b82f6] max-w-md w-full text-center shadow-2xl">

                        <h2 className="text-2xl font-bold text-white mb-4">Onay Ekranı</h2>
                        <p className="text-gray-300 mb-6">
                            Yeni kullanıcı oluşturmak istediğinize emin misiniz?
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    handleSubmit(); 
                                }}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold"
                            >
                                Evet
                            </button>

                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold"
                            >
                                Hayır
                            </button>
                        </div>

                    </div>
                </div>
            )}



            {/* Success Modal */}
            {showSuccessModal && response && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-[#1a1a2e] p-8 rounded-xl border border-[#3b82f6] max-w-md w-full text-center relative z-[10000]">
                        <h2 className="text-2xl font-bold mb-4">Kullanıcı Oluşturuldu ✔</h2>

                        <p className="text-gray-300 mb-3">📧 {response.email}</p>
                        <p className="text-sm text-gray-400">
                            Bu bilgiler kullanıcıya e-posta ile gönderildi.
                        </p>
                    </div>
                </div>
            )}
        </div>


    );
};

export default AddUserPage;