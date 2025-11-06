// pages/AddUserPage.tsx (Güncellenmiş)
import React, { useState } from "react";

const API_URL = "http://localhost:8080"; // senin backend portun

const AddUserPage: React.FC = () => {
    const [form, setForm] = useState({
        name: "",
        surname: "",
        password: "",
        role: "Student",
    });

    const [response, setResponse] = useState<{ message?: string; email?: string; password?: string } | null>(null);
    const [loading, setLoading] = useState(false);

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
                    password: data.password, // backend'den gelen şifre
                });
            } else {
                setResponse({
                    message: data.message || "❌ Kullanıcı oluşturulamadı.",
                });
            }
        } catch (err) {
            console.error("🚫 Sunucu hatası:", err);
            setResponse({ message: "❌ Sunucuya bağlanılamadı." });
        } finally {
            setLoading(false);
            setForm({ name: "", surname: "", password: "", role: "Student" });
        }
    };

    // 🧱 UI
    return (
        <div className="p-8 max-w-xl mx-auto bg-gray-800 shadow-2xl rounded-xl">
            <h1 className="text-3xl font-extrabold text-center mb-8 text-indigo-400">
                Yeni Kullanıcı Oluştur
            </h1>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        name="name"
                        placeholder="İsim"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    />
                    <input
                        name="surname"
                        placeholder="Soyisim"
                        value={form.surname}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    />
                </div>

                <input
                    name="password"
                    type="password"
                    placeholder="Şifre (manuel veya otomatik)"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                />

                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 appearance-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                >
                    <option value="Student">Öğrenci</option>
                    <option value="Academic">Akademisyen</option>
                    <option value="ClubManager">Kulüp Yöneticisi</option>
                    <option value="Admin">Admin</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 text-lg font-bold rounded-lg transition duration-200 ${loading
                            ? "bg-indigo-700 text-indigo-200 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                        }`}
                >
                    {loading ? "Kaydediliyor..." : "Kullanıcı Oluştur"}
                </button>
            </form>

            {/* RESPONSE */}
            {response && (
                <div
                    className={`mt-6 p-4 rounded-lg shadow-inner ${response.message?.startsWith("✅")
                            ? "bg-green-800 text-green-200 border border-green-700"
                            : "bg-red-800 text-red-200 border border-red-700"
                        }`}
                >
                    <p className="font-semibold mb-1">{response.message}</p>
                    {response.email && (
                        <p>
                            📧 <strong className="font-bold">E-posta:</strong> {response.email}
                        </p>
                    )}
                    {response.password && (
                        <p>
                            🔑 <strong className="font-bold">Geçici Şifre:</strong> {response.password}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddUserPage;