import React from "react";
import { useNavigate } from "react-router-dom";

interface ClubsPageProps {
    clubs: any[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;

    handleJoinClub: (clubId: number) => void;
    handleLeaveClub: (clubId: number) => void;
    getClubIcon: (name: string) => any;


    searchTerm: string;
    setSearchTerm: (value: string) => void;

    departments: any[];
    selectedDept: string;
    setSelectedDept: (value: string) => void;
}



const ClubsPage: React.FC<ClubsPageProps> = ({
    clubs,
    currentPage,
    totalPages,
    setCurrentPage,
    handleJoinClub,
    handleLeaveClub,
    getClubIcon,
    searchTerm,
    setSearchTerm,
    departments,
    selectedDept,
    setSelectedDept
}) => {

const navigate = useNavigate();

    return (
        <div className="text-white">
            <h1
                className="text-4xl font-bold mb-12 antialiased
  bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
  bg-clip-text text-transparent inline-block"
            >
                Kulüpler
            </h1>


      

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

            {/* 🤖 Yapay Zeka Kulüp Öneri Butonu */}
            <button
                onClick={() => navigate("/recommendations")}
                className="w-1/3 p-3 rounded-lg font-semibold 
                   bg-gradient-to-r from-purple-600 to-blue-600 
                   text-white hover:scale-105 transition-all shadow-lg"
            >
                🤖 Kararsız Hissediyorum
            </button>

        </div>


            {/* Kulüp Kartları */}
            {clubs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Henüz kulüp bulunmamaktadır.
                    </p>
                </div>
            ) : (
                    <div className="flex flex-col gap-6 w-[80%] mx-auto">


                        {clubs
                            .sort((a, b) => a.name.localeCompare(b.name, "tr"))   // 🔥 alfabetik sırala (Türkçe)
                            .map((club) => {


                        const iconData = getClubIcon(club.name);

                        return (
                            <div
                                key={club.id}
                                className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e]
                                           border border-[#3b82f6]/40 rounded-xl p-4
                                           shadow-xl hover:border-[#3b82f6] transition-all duration-300"
                            >
                                <div className="flex items-start space-x-4 mb-2">
                                    <div
                                        className={`w-12 h-12 bg-gradient-to-br ${iconData.color}
                                                    rounded-full flex items-center justify-center text-xl`}
                                    >
                                        {iconData.icon}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-1">
                                            {club.name}
                                        </h3>
                                        <p className="text-gray-400 text-base mb-1">
                                            {club.departmentName}
                                        </p>
                                        <p className="text-gray-400 text-base leading-snug">

                                            {club.description || "Açıklama bulunmuyor."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    {!club.isMember ? (
                                        <button
                                            onClick={() => handleJoinClub(club.id)}
                                            className="px-5 py-2 rounded-lg font-semibold text-white 
            bg-gradient-to-r from-[#2d1b69] to-[#3b82f6] hover:scale-[1.02] transition-all"
                                        >
                                            Kulübe Katıl
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleLeaveClub(club.id)}
                                            className="px-5 py-2 rounded-lg font-semibold text-white 
            bg-gradient-to-r from-indigo-700 to-indigo-900 hover:scale-[1.02] transition-all"
                                        >
                                            Kulüpten Ayrıl
                                        </button>
                                    )}
                                </div>
                 </div>
                        );
                            })}

                        {/* Sayfalama (Pagination) Butonları */}
                        <div className="flex justify-center items-center gap-4 mt-8">

                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className={`px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#3b82f6] 
        ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-[#3b82f6]"}`}
                            >
                                ◀ Önceki
                            </button>

                            <span className="text-lg text-gray-300">
                                Sayfa {currentPage} / {totalPages}
                            </span>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className={`px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#3b82f6]
        ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-[#3b82f6]"}`}
                            >
                                Sonraki ▶
                            </button>

                        </div>

                </div>
            )}
        </div>
    );
};

export default ClubsPage;
