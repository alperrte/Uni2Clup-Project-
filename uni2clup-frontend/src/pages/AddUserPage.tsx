import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8080"; // senin backend portun

const AddUserPage: React.FC = () => {
    const [form, setForm] = useState({
        name: "",
        surname: "",
        password: "",
        role: "Student",
    });

    const [response, setResponse] = useState<{ message?: string; email?: string; password?: string } | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const token = localStorage.getItem("token")?.trim() || "";
    const userRole = localStorage.getItem("userRole");

    // ✅ Sayfa açıldığında kontrol ve listeleme
    useEffect(() => {
        if (!token) {
            alert("🔒 Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
            localStorage.clear();
            window.location.reload();
            return;
        }

        if (userRole !== "Admin") {
            alert("🚫 Bu sayfaya sadece admin erişebilir.");
            localStorage.clear();
            window.location.reload();
            return;
        }

        fetchUsers();
    }, []);

    // 👥 Kullanıcıları Listele
    const fetchUsers = async () => {
        setFetching(true);
        try {
            const res = await fetch(`${API_URL}/api/Auth/users`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                alert("🔒 Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("🚫 Kullanıcı listesi alınamadı:", error);
        } finally {
            setFetching(false);
        }
    };

    // Form input değişikliği
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ✅ Kullanıcı oluşturma
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);

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

                await fetchUsers();
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

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bu kullanıcıyı silmek istiyor musunuz?")) return;

        try {
            const res = await fetch(`${API_URL}/api/Auth/delete/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                alert("🚫 Token geçersiz. Lütfen tekrar giriş yapın.");
                localStorage.clear();
                window.location.reload();
                return;
            }

            if (res.ok) {
                setUsers(users.filter((u) => u.id !== id));
            } else {
                alert("❌ Kullanıcı silinemedi.");
            }
        } catch {
            alert("🚫 Sunucu bağlantı hatası!");
        }
    };

    const translateRole = (role: string) => {
        switch (role) {
            case "Admin":
                return "Yönetici";
            case "Student":
                return "Öğrenci";
            case "Academic":
                return "Akademisyen";
            case "ClubManager":
                return "Kulüp Yöneticisi";
            default:
                return role;
        }
    };

    // 🧱 UI
    return (
        <div className="p-6 max-w-5xl mx-auto bg-white shadow rounded-lg mt-10">
            <h1 className="text-2xl font-semibold text-center mb-5 text-indigo-700">
                Yeni Kullanıcı Oluştur
            </h1>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <input
                    name="name"
                    placeholder="İsim"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                />
                <input
                    name="surname"
                    placeholder="Soyisim"
                    value={form.surname}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md p-2"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Şifre (manuel veya otomatik)"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full border border-gray-300 rounded-md p-2"
                />
                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                >
                    <option value="Student">Öğrenci</option>
                    <option value="Academic">Akademisyen</option>
                    <option value="ClubManager">Kulüp Yöneticisi</option>
                    <option value="Admin">Admin</option>
                </select>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md"
                >
                    {loading ? "Kaydediliyor..." : "Kullanıcı Ekle"}
                </button>
            </form>

            {/* RESPONSE */}
            {response && (
                <div
                    className={`mt-4 p-3 rounded ${response.message?.startsWith("✅")
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    <p>{response.message}</p>
                    {response.email && (
                        <p>
                            📧 <strong>E-posta:</strong> {response.email}
                        </p>
                    )}
                    {response.password && (
                        <p>
                            🔑 <strong>Geçici Şifre:</strong> {response.password}
                        </p>
                    )}
                </div>
            )}

            {/* USER LIST */}
            <h2 className="text-xl font-semibold text-indigo-700 mt-8 mb-3">
                Mevcut Kullanıcılar
            </h2>
            {fetching ? (
                <p>🔄 Kullanıcılar yükleniyor...</p>
            ) : users.length === 0 ? (
                <p className="text-gray-500">Henüz kullanıcı yok.</p>
            ) : (
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <thead className="bg-indigo-100 text-indigo-700">
                        <tr>
                            <th className="py-2 px-3 text-left">ID</th>
                            <th className="py-2 px-3 text-left">Ad Soyad</th>
                            <th className="py-2 px-3 text-left">Email</th>
                            <th className="py-2 px-3 text-left">Rol</th>
                            <th className="py-2 px-3 text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t hover:bg-gray-50">
                                <td className="py-2 px-3">{user.id}</td>
                                <td className="py-2 px-3">
                                    {user.name} {user.surname}
                                </td>
                                <td className="py-2 px-3">{user.email}</td>
                                <td className="py-2 px-3">{translateRole(user.role)}</td>
                                <td className="py-2 px-3 text-center">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-800 font-semibold"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AddUserPage;
