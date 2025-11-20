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
                clubName: localStorage.getItem("userName") || "",
                description: "",
            });

        } else {
            clearSelected();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Etkinlik İsmi */}
                <div className="group">
                    <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                        <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Etkinlik İsmi"
                                value={form.name}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Kontenjan */}
                <div className="group">
                    <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                        <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99L12 11l-1.99-2.01A2.5 2.5 0 0 0 8 8H5.46c-.8 0-1.54.37-2.01.99L1 14.5V22h2v-6h2.5l2.54-7.63A1.5 1.5 0 0 1 9.46 8H12c.8 0 1.54.37 2.01.99L16 11l1.99-2.01A2.5 2.5 0 0 1 20 8h2.5l-2.54 7.63A1.5 1.5 0 0 1 18.54 16H16v6h4z" />
                                </svg>
                            </div>
                            <input
                                type="number"
                                name="capacity"
                                placeholder="Kontenjan"
                                value={form.capacity}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Yer Bilgisi */}
                <div className="group">
                    <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                        <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="location"
                                placeholder="Yer Bilgisi"
                                value={form.location}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Kulüp İsmi */}
                <div className="group">
                    <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                        <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="clubName"
                                placeholder="Kulüp İsmi"
                                value={form.clubName}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Başlangıç Tarihi */}
                <div className="group">
                    <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                        <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                </svg>
                            </div>
                            <input
                                type="datetime-local"
                                name="startDate"
                                min={new Date().toISOString().slice(0, 16)}

                                value={form.startDate}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-white outline-none text-lg cursor-pointer"
                                style={{
                                    colorScheme: 'dark',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'textfield'
                                }}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Bitiş Tarihi */}
                <div className="group">
                    <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                        <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                                </svg>
                            </div>
                            <input
                                type="datetime-local"
                                name="endDate"
                                min={new Date().toISOString().slice(0, 16)}

                                value={form.endDate}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-white outline-none text-lg cursor-pointer"
                                style={{
                                    colorScheme: 'dark',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'textfield'
                                }}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Açıklama */}
            <div className="mt-6 group">
                <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e] border-2 border-transparent bg-clip-padding rounded-xl p-1 hover:border-[#3b82f6] transition-all duration-300">
                    <div className="bg-[#0f0f1a] rounded-lg p-4 flex items-start space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] rounded-full flex items-center justify-center mt-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                        </div>
                        <textarea
                            name="description"
                            placeholder="Etkinlik Açıklaması"
                            value={form.description}
                            onChange={handleChange}
                            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg resize-none min-h-[100px]"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="mt-8 w-full bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:from-[#4a2a8a] hover:to-[#4f94f6] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse"></div>
                <div className="relative flex items-center justify-center space-x-2">
                    {selectedEvent ? (
                        <>
                            <span>💾 Değişiklikleri Kaydet</span>
                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                        </>
                    ) : (
                        <>
                            <span>✨ Etkinliği Oluştur</span>
                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                        </>
                    )}
                </div>
            </button>
        </form>
    );
}

export default EventForm;