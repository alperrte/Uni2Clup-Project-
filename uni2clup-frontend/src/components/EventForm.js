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

    useEffect(() => {
        if (selectedEvent) {
            setForm(selectedEvent);
        } else {
            setForm({
                name: "",
                capacity: "",
                location: "",
                startDate: "",
                endDate: "",
                clubName: "",
                description: "",
            });
        }
    }, [selectedEvent]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
        clearSelected();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full max-w-2xl"
        >
            <h2 className="text-xl font-semibold mb-4">
                {selectedEvent ? "Etkinlik Düzenle" : "Yeni Etkinlik Oluþtur"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Etkinlik Ýsmi"
                    value={form.name}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white"
                    required
                />
                <input
                    type="number"
                    name="capacity"
                    placeholder="Kontenjan"
                    value={form.capacity}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white"
                    required
                />
                <input
                    type="text"
                    name="location"
                    placeholder="Yer Bilgisi"
                    value={form.location}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white"
                    required
                />
                <input
                    type="text"
                    name="clubName"
                    placeholder="Kulüp Ýsmi"
                    value={form.clubName}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white"
                    required
                />
                <input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate?.slice(0, 16) || ""}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white"
                    required
                />
                <input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate?.slice(0, 16) || ""}
                    onChange={handleChange}
                    className="p-2 rounded bg-white/10 border border-white/20 text-white"
                    required
                />
            </div>

            <textarea
                name="description"
                placeholder="Etkinlik Açýklamasý"
                value={form.description}
                onChange={handleChange}
                className="w-full mt-4 p-2 rounded bg-white/10 border border-white/20 text-white"
                required
            />

            <button
                type="submit"
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg font-semibold"
            >
                {selectedEvent ? "Deðiþiklikleri Kaydet" : "Etkinliði Oluþtur"}
            </button>
        </form>
    );
}

export default EventForm;
