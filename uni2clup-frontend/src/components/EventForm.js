import React, { useState, useEffect } from "react";

function EventForm({ onSave, selectedEvent, clearSelected }) {
    const [form, setForm] = useState({
        name: "",
        capacity: "",
        location: "",
        startDate: "",
        endDate: "",
        clubName: "",
        description: "",
    });

    // 🔹 Sayfa yüklendiğinde veya düzenleme moduna geçildiğinde formu ayarla
    useEffect(() => {
        if (selectedEvent) {
            setForm(selectedEvent);
        } else {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            setForm({
                name: "",
                capacity: "",
                location: "",
                startDate: now.toISOString().slice(0, 16),
                endDate: oneHourLater.toISOString().slice(0, 16),
                clubName: "",
                description: "",
            });
        }
    }, [selectedEvent]);

    // 🔹 Input değişikliklerini yakala
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Form gönderildiğinde çalışır
    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedForm = {
            Id: selectedEvent?.id || 0, // 👈 düzenleme varsa id ekle
            Name: form.name,
            Capacity: parseInt(form.capacity, 10),
            Location: form.location,
            StartDate: new Date(form.startDate).toISOString(), // 👈 tarihleri ISO formatına çevir
            EndDate: new Date(form.endDate).toISOString(),
            ClubName: form.clubName,
            Description: form.description,
        };

        console.log("📤 Gönderilen veri:", formattedForm);
        onSave(formattedForm);

        // 🔹 Yeni kayıt sonrası formu sıfırla
        if (!selectedEvent) {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            setForm({
                name: "",
                capacity: "",
                location: "",
                startDate: now.toISOString().slice(0, 16),
                endDate: oneHourLater.toISOString().slice(0, 16),
                clubName: "",
                description: "",
            });
        } else {
            clearSelected();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full max-w-2xl shadow-lg"
        >
            <h2 className="text-xl font-semibold mb-4 text-center">
                {selectedEvent ? "✏️ Etkinliği Düzenle" : "🆕 Yeni Etkinlik Oluştur"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Etkinlik İsmi"
                    value={form.name}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-300"
                    required
                />
                <input
                    type="number"
                    name="capacity"
                    placeholder="Kontenjan"
                    value={form.capacity}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-300"
                    required
                />
                <input
                    type="text"
                    name="location"
                    placeholder="Yer Bilgisi"
                    value={form.location}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-300"
                    required
                />
                <input
                    type="text"
                    name="clubName"
                    placeholder="Kulüp İsmi"
                    value={form.clubName}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-300"
                    required
                />
                <input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white"
                    required
                />
                <input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white"
                    required
                />
            </div>

            <textarea
                name="description"
                placeholder="Etkinlik Açıklaması"
                value={form.description}
                onChange={handleChange}
                className="w-full mt-4 p-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-300"
                required
            />

            <button
                type="submit"
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-semibold transition"
            >
                {selectedEvent ? "💾 Değişiklikleri Kaydet" : "✨ Etkinliği Oluştur"}
            </button>
        </form>
    );
}

export default EventForm;
