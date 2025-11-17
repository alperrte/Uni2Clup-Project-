import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface Application {
    id: number;
    name: string;
    surname: string;
    email: string;
    department: string;
    status: string;
    createdAt: string;
}

const StudentApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const api = axios.create({
        baseURL: "http://localhost:8080/api/Auth",
    });

    const fetchApplications = async (): Promise<void> => {
        try {
            setLoading(true);
            const res = await api.get<Application[]>("/get-applications");
            setApplications(res.data);
        } catch (err: unknown) {
            const axiosError = err as AxiosError;
            console.error("Başvuru alma hatası:", axiosError.message);
            setError("Başvurular alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number): Promise<void> => {
        try {
            await api.post(`/approve/${id}`);
            await fetchApplications();
            alert("✅ Başvuru onaylandı ve kullanıcı oluşturuldu.");
        } catch (err: unknown) {
            console.error("Onay hatası:", err);
            alert("❌ Onay işlemi başarısız oldu.");
        }
    };

    const handleReject = async (id: number): Promise<void> => {
        try {
            await api.post(`/reject/${id}`);
            await fetchApplications();
            alert("🚫 Başvuru reddedildi.");
        } catch (err: unknown) {
            console.error("Reddetme hatası:", err);
            alert("❌ Reddetme işlemi başarısız oldu.");
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    if (loading) return <p className="text-center mt-10">Yükleniyor...</p>;
    if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Öğrenci Başvuruları</h1>

            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="border p-2">Ad</th>
                        <th className="border p-2">Soyad</th>
                        <th className="border p-2">E-posta</th>
                        <th className="border p-2">Bölüm</th>
                        <th className="border p-2">Durum</th>
                        <th className="border p-2 text-center">İşlem</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center p-4">
                                Başvuru bulunamadı.
                            </td>
                        </tr>
                    ) : (
                        applications.map((app) => (
                            <tr key={app.id}>
                                <td className="border p-2">{app.name}</td>
                                <td className="border p-2">{app.surname}</td>
                                <td className="border p-2">{app.email}</td>
                                <td className="border p-2">{app.department}</td>
                                <td className="border p-2">{app.status}</td>
                                <td className="border p-2 text-center space-x-2">
                                    {app.status === "Beklemede" ? (
                                        <>
                                            <button
                                                onClick={() => handleApprove(app.id)}
                                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                            >
                                                Onayla
                                            </button>
                                            <button
                                                onClick={() => handleReject(app.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            >
                                                Reddet
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-gray-500 italic">
                                            {app.status === "Onaylandı"
                                                ? "✅ Onaylandı"
                                                : "❌ Reddedildi"}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StudentApplicationsPage;
