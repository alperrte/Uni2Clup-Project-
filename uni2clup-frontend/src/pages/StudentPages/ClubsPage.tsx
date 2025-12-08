import React from "react";
import { useNavigate } from "react-router-dom";

interface ClubsPageProps {
    clubs: any[];
    currentPage: number;
    setCurrentPage: (page: number) => void;

    handleJoinClub: (clubId: number) => void;
    handleLeaveClub: (clubId: number) => void;
    getClubIcon: (name: string, departmentName?: string) => any;



    searchTerm: string;
    setSearchTerm: (value: string) => void;

    departments: any[];
    selectedDept: string;
    setSelectedDept: (value: string) => void;
}



const ClubsPage: React.FC<ClubsPageProps> = ({
    clubs,
    currentPage,
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

    // 1️⃣ Arama ve filtre uygulanmış kulüpler
    const filteredClubs = clubs.filter((club) => {
        const matchSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchDept =
            selectedDept === "" || selectedDept === "Tüm Bölümler"
                ? true
                : club.departmentName === departments.find(d => d.id == selectedDept)?.name;

        const notMember = !club.isMember; // 🎯 en kritik satır: üyesi olunan kulüpler listeden kalkar

        return matchSearch && matchDept && notMember;
    });


    // 2️⃣ Sayfalama hesaplama artık filteredClubs üzerinden yapılacak
    const itemsPerPage = 4; // sen kaç kullanıyorsan
    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedClubs = filteredClubs
        .sort((a, b) => a.name.localeCompare(b.name, "tr"))
        .slice(startIndex, startIndex + itemsPerPage);

    // 3️⃣ Toplam sayfa sayısı hesapla
    const totalFilteredPages = Math.ceil(filteredClubs.length / itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedDept]);


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
            {filteredClubs.length === 0 ? (

                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Henüz kulüp bulunmamaktadır.
                    </p>
                </div>
            ) : (
                    <div className="flex flex-col gap-6 w-[80%] mx-auto">


                        {paginatedClubs.map((club) => {
                            const iconData = getClubIcon(club.name, club.departmentName);

                            return (
                                <div
                                    key={club.id}
                                    className="
                relative
                bg-gradient-to-br from-[#1b1c2e]/60 via-[#151627]/70 to-[#0f1020]/90
                backdrop-blur-xl
                border border-[#3b82f6]/40
                rounded-2xl p-6
                shadow-[0_0_25px_rgba(0,0,0,0.25)]
                hover:shadow-[0_0_45px_rgba(59,130,246,0.25)]
                transition-all duration-300
                hover:scale-[1.01]
        ">

                                    {/* SOL ŞERİT */}
                                    <div className="absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-[#3b82f6] to-[#6366f1] rounded-l-2xl"></div>

                                    <div className="flex items-start justify-between gap-6">

                                        {/* İKON */}
                                        <div
                                            className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center
                        bg-gradient-to-br ${iconData.color}
                        shadow-[0_0_15px_rgba(255,255,255,0.18)]
                        flex-shrink-0
                    `}
                                        >
                                            <span className="text-2xl text-white drop-shadow-md">
                                                {iconData.icon}
                                            </span>
                                        </div>

                                        {/* YAZILAR */}
                                        <div className="flex-1">
                                            <h3 className="text-[22px] font-semibold tracking-wide text-white leading-tight mb-1">
                                                {club.name}
                                            </h3>

                                            <p className="text-gray-300 text-[15px] mb-1">
                                                {club.departmentName}
                                            </p>

                                            <p className="text-gray-200 text-[15px] leading-relaxed">
                                                {club.description || "Açıklama bulunmuyor."}
                                            </p>
                                        </div>

                                        {/* BUTON — SADECE KATIL */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleJoinClub(club.id)}
                                                className="
                            px-5 py-2 rounded-xl font-semibold text-white
                            bg-gradient-to-r from-[#4f46e5] to-[#3b82f6]
                            shadow-[0_4px_14px_rgba(59,130,246,0.45)]
                            hover:from-[#6d5cff] hover:to-[#60a5fa]
                            transition-all duration-300 hover:scale-105
                        "
                                            >
                                                Kulübe Katıl
                                            </button>
                                        </div>

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
                                Sayfa {currentPage} / {totalFilteredPages}

                            </span>

                            <button
                                disabled={currentPage === totalFilteredPages}

                                onClick={() => setCurrentPage(currentPage + 1)}
                                className={`px-4 py-2 rounded-lg bg-[#1a1a2e] border border-[#3b82f6]
        ${currentPage === totalFilteredPages ? "opacity-40 cursor-not-allowed" : "hover:bg-[#3b82f6]"}`}
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
