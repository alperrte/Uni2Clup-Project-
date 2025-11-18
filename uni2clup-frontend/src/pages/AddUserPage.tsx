import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8080";

interface FormState {
    name: string;
    surname: string;
    email: string;
    role: string;
    clubId?: number;
}

interface Club {
    id: number;
    name: string;
    department: string;
    isActive: boolean;
}

interface ApiResponse {
    message?: string;
    email?: string;
    password?: string;
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
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loadingClubs, setLoadingClubs] = useState<boolean>(false);

    const token = localStorage.getItem("token")?.trim() || "";

    // Kulüpleri yükle
    useEffect(() => {
        const fetchClubs = async () => {
            if (!token) return;
            setLoadingClubs(true);
            try {
                const res = await fetch(`${API_URL}/api/Club`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data: Club[] = await res.json();
                    // Sadece aktif kulüpleri göster
                    setClubs(data.filter(c => c.isActive));
                }
            } catch (error) {
                console.error("Kulüpler yüklenemedi:", error);
            } finally {
                setLoadingClubs(false);
            }
        };

        fetchClubs();
    }, [token]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

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
                    password: data.password,
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
        <div className="min-h-screen text-white flex items-center justify-center py-10 px-4 relative">
            <div className="relative z-10 w-full max-w-2xl">

                <h1 className="text-4xl text-center font-bold mb-6">
                    Yeni Kullanıcı Oluştur
                </h1>

                <div className="rounded-xl p-8 shadow-xl border border-[#3b82f6]/30">

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Name */}
                        <input
                            name="name"
                            placeholder="İsim"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20"
                        />

                        {/* Surname */}
                        <input
                            name="surname"
                            placeholder="Soyisim"
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

                        {/* Role */}
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 cursor-pointer"
                        >
                            <option value="Academic">Akademisyen</option>
                            <option value="Admin">Admin</option>
                        </select>

                        {/* Club Selection - Sadece Kulüp Yöneticisi için */}
                        {form.role === "ClubManager" && (
                            <select
                                name="clubId"
                                value={form.clubId || ""}
                                onChange={(e) => setForm({ ...form, clubId: e.target.value ? parseInt(e.target.value) : undefined })}
                                required={form.role === "ClubManager"}
                                className="w-full p-4 bg-[#0f0f1a] rounded-lg text-white border border-[#3b82f6]/20 cursor-pointer"
                            >
                                <option value="">Kulüp Seçin *</option>
                                {loadingClubs ? (
                                    <option>Yükleniyor...</option>
                                ) : (
                                    clubs.map((club) => (
                                        <option key={club.id} value={club.id}>
                                            {club.name} ({club.department})
                                        </option>
                                    ))
                                )}
                            </select>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] py-4 rounded-xl font-bold disabled:opacity-50"
                        >
                            {loading ? "Kaydediliyor..." : "Kullanıcı Oluştur"}
                        </button>
                    </form>

                    {/* Error Message */}
                    {response && !showSuccessModal && (
                        <div className="mt-6 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">
                            {response.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal - z-index artırıldı */}
            {showSuccessModal && response && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-[#1a1a2e] p-8 rounded-xl border border-[#3b82f6] max-w-md w-full text-center relative z-[10000]">
                        <h2 className="text-2xl font-bold mb-4">Kullanıcı Oluşturuldu ✔</h2>

                        <p className="text-gray-300 mb-3">📧 {response.email}</p>
                        <p className="text-gray-300 mb-3">
                            🔑 Geçici Şifre: <b>{response.password}</b>
                        </p>

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