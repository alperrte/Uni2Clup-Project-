// ClubsPage.tsx
import React from "react";

interface ClubsPageProps {
    clubs: any[];
    handleJoinClub: (id: number) => void;
    handleLeaveClub: (id: number) => void;
    getClubIcon: (name: string) => { icon: string; color: string };
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    departments: any[];
    selectedDept: string;
    setSelectedDept: (value: string) => void;
}

const ClubsPage: React.FC<ClubsPageProps> = ({
    clubs,
    handleJoinClub,
    handleLeaveClub,
    getClubIcon,
    searchTerm,
    setSearchTerm,
    departments,
    selectedDept,
    setSelectedDept
}) => {
    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Kulüpler</h1>
            <p className="text-gray-400 mb-8">Tüm Aktif Kulüpler</p>

            {/* Arama + Filtre */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kulüp ara..."
                    className="w-1/3 p-3 rounded-lg 
                               bg-[#1a1a2e] border border-[#3b82f6]/50 text-white"
                />

                <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-1/3 p-3 rounded-lg 
                               bg-[#1a1a2e] border border-[#3b82f6]/50 text-white"
                >
                    <option value="">Tüm Bölümler</option>
                    {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Kulüp Kartları */}
            {clubs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Henüz kulüp bulunmamaktadır.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">

                    {clubs.map((club) => {
                        const iconData = getClubIcon(club.name);

                        return (
                            <div
                                key={club.id}
                                className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e]
                                           border border-[#3b82f6]/40 rounded-xl p-6
                                           shadow-xl hover:border-[#3b82f6] transition-all duration-300"
                            >
                                <div className="flex items-start space-x-4 mb-4">
                                    <div
                                        className={`w-16 h-16 bg-gradient-to-br ${iconData.color}
                                                    rounded-full flex items-center justify-center text-2xl`}
                                    >
                                        {iconData.icon}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {club.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-2">
                                            {club.departmentName || club.department}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {club.description || "Açıklama bulunmuyor."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {!club.isMember ? (
                                        <button
                                            onClick={() => handleJoinClub(club.id)}
                                            className="flex-1 bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
                                                       hover:from-[#4a2a8a] hover:to-[#4f94f6]
                                                       py-3 rounded-lg font-semibold text-white"
                                        >
                                            Kulübe Üye Ol
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleLeaveClub(club.id)}
                                            className="flex-1 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 py-3 rounded-lg font-semibold text-white"

                                        >
                                            Kulüpten Ayrıl
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClubsPage;
