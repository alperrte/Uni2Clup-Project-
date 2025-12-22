import React, { useState, useEffect } from "react";

interface Props {
    eventName: string;
    onClose: () => void;
    onSubmit: (ratings: { q1: number; q2: number; q3: number; q4: number; q5: number }) => Promise<void>;
}

const questions = [
    "Etkinliğin genel kalitesi nasıldı?",
    "Konuşmacı / anlatıcı yeterli miydi?",
    "Etkinlik içeriği beklentilerinizi karşıladı mı?",
    "Organizasyon ve düzen nasıldı?",
    "Bu etkinliği başkalarına önerir misiniz?"
];

const SurveyModal: React.FC<Props> = ({ eventName, onClose, onSubmit }) => {

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);


    const [ratings, setRatings] = useState({
        q1: 0, q2: 0, q3: 0, q4: 0, q5: 0
    });

    const [hoverValue, setHoverValue] = useState<{ [key: string]: number }>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);

    const update = (key: string, value: number) => {
        setRatings(prev => ({ ...prev, [key]: value }));
    };

    // ⭐ STAR COMPONENT (Hover + Click)
    const renderStars = (key: string, selected: number) => (
        <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map(star => {
                const displayValue = hoverValue[key] || selected;

                return (
                    <span
                        key={star}
                        className={`
                            text-3xl cursor-pointer transition duration-150
                            ${star <= displayValue ? "text-yellow-400" : "text-gray-500"}
                            hover:scale-110
                        `}
                        onMouseEnter={() => setHoverValue(prev => ({ ...prev, [key]: star }))}
                        onMouseLeave={() => setHoverValue(prev => ({ ...prev, [key]: 0 }))}
                        onClick={() => update(key, star)}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );

    const handleSubmit = async () => {
        setConfirmOpen(false);
        await onSubmit(ratings);
        setSuccessOpen(true);
    };

    return (
        <>
            {/* ANA MODAL */}
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
                <div className="bg-[#0f0f1a] border border-[#3b82f6]/40 p-8 rounded-2xl w-full max-w-xl text-white relative shadow-xl">

                    {/* Kapat */}
                    <button onClick={onClose} className="absolute top-3 right-3 text-3xl hover:text-red-400">×</button>

                    <h2 className="text-3xl font-bold mb-2 text-[#3b82f6]">
                        {eventName} – Değerlendirme
                    </h2>

                    <p className="text-gray-300 mb-6">
                        Aşağıdaki soruları 1 ile 5 yıldız arasında değerlendirerek etkinlik hakkındaki görüşlerinizi belirtiniz.
                    </p>

                    {/* SORULAR */}
                    {questions.map((q, i) => {
                        const key = `q${i + 1}` as keyof typeof ratings;

                        return (
                            <div key={i} className="mb-6">
                                <p className="text-lg mb-1">{q}</p>
                                {renderStars(key, ratings[key])}
                            </div>
                        );
                    })}

                    {/* GÖNDER */}
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="w-full mt-4 py-3 bg-[#3b82f6] rounded-xl font-semibold hover:bg-[#315fcc] transition"
                    >
                        Gönder
                    </button>
                </div>
            </div>

            {/* CONFIRM MODAL */}
            {confirmOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]">
                    <div className="bg-[#101020] border border-yellow-500/40 p-6 rounded-2xl w-full max-w-sm text-white text-center">

                        <h3 className="text-xl font-bold mb-3 text-yellow-400">Emin misiniz?</h3>
                        <p className="text-gray-300 mb-6">Değerlendirmenizi göndermek istediğinize emin misiniz?</p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="px-5 py-2 bg-gray-600 rounded-xl hover:bg-gray-700"
                            >
                                Vazgeç
                            </button>

                            <button
                                onClick={handleSubmit}
                                className="px-5 py-2 bg-yellow-500 rounded-xl text-black font-bold hover:bg-yellow-400"
                            >
                                Gönder
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS MODAL */}
            {successOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]">
                    <div className="bg-[#0f0f1a] border border-green-500/40 p-6 rounded-2xl w-full max-w-sm text-white text-center">

                        <h3 className="text-2xl font-bold mb-3 text-green-400">Teşekkürler! 🎉</h3>
                        <p className="text-gray-300 mb-6">
                            Değerlendirmeniz başarıyla kaydedildi.
                        </p>

                        <button
                            onClick={() => { setSuccessOpen(false); onClose(); }}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

        </>
    );
};

export default SurveyModal;
