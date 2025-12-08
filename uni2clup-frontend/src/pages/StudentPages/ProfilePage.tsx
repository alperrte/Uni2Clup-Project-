import React from "react";

interface ClubItem {
    id: number;
    name: string;
    departmentName?: string;
    description?: string;
    isMember?: boolean; 
}

interface ProfileData {
    name: string;
    surname: string;
    email: string;
    departmentName?: string;
    clubs?: ClubItem[];
    joinedEventsCount?: number;
    unreadNotifications?: number;
}

interface ClubIconData {
    icon: React.ReactNode;
    color: string;
}

interface ProfilePageProps {
    profile: ProfileData | null;
    getClubIcon: (clubName: string, department?: string) => ClubIconData;
    handleLeaveClub: (clubId: number) => void;   
    myEvents: any[];
    pastEvents: any[];

}


const ProfilePage: React.FC<ProfilePageProps> = ({ profile, getClubIcon, handleLeaveClub, myEvents, pastEvents }) => {
    return (
        <div className="text-white">
            <h1
                className="text-4xl font-bold mb-12 antialiased
  bg-gradient-to-r from-[#2d1b69] to-[#3b82f6]
  bg-clip-text text-transparent inline-block"
            >
                Profil
            </h1>



            {profile ? (
                <div
                    className="
relative
bg-[#0d0f21]/80 
rounded-3xl
p-10 
border border-[#3b82f6]/20 
shadow-[0_0_25px_rgba(59,130,246,0.15)] 
backdrop-blur-md
transition-all duration-300
hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]
"

                >


                    {/* Avatar */}
                    <div
                        className="
        w-32 h-32 mx-auto mb-6 rounded-full
        bg-gradient-to-br from-[#2d1b69] to-[#3b82f6]
        flex items-center justify-center
        shadow-[0_0_25px_rgba(59,130,246,0.45)]
        border-4 border-[#3b82f6]/60
        transition-all duration-300 hover:scale-105
    "
                    >
                        <span className="text-4xl font-bold text-white drop-shadow-lg">
                            {profile.name.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* İstatistik Kutuları */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 mt-6">

                        {/* Üye Kulüp Sayısı */}
                        <div className="
        bg-gradient-to-br from-[#2d1b69] via-[#3b82f6]/80 to-[#60a5fa]/70
        border border-[#3b82f6]/50 
        shadow-[0_0_25px_rgba(59,130,246,0.35)]
        hover:shadow-[0_0_40px_rgba(59,130,246,0.45)]
        hover:scale-[1.02]
        transition-all duration-300
        rounded-2xl p-6 flex flex-col items-center
    ">
                            <div className="text-4xl font-bold text-white drop-shadow-md">
                                {profile?.clubs?.length ?? 0}
                            </div>
                            <div className="text-gray-100 text-sm mt-2">
                                Üye Olduğu Kulüp Sayısı
                            </div>
                        </div>

                        {/* Katıldığı Etkinlik */}
                        <div className="
        bg-gradient-to-br from-[#2d1b69] via-[#3b82f6]/80 to-[#60a5fa]/70
        border border-[#3b82f6]/50 
        shadow-[0_0_25px_rgba(59,130,246,0.35)]
        hover:shadow-[0_0_40px_rgba(59,130,246,0.45)]
        hover:scale-[1.02]
        transition-all duration-300
        rounded-2xl p-6 flex flex-col items-center
    ">
                            <div className="text-4xl font-bold text-white drop-shadow-md">
                                {myEvents.length}
                            </div>
                            <div className="text-gray-100 text-sm mt-2">
                                Katıldığı Etkinlik Sayısı
                            </div>
                        </div>

                        {/* Kaçırdığı Etkinlik */}
                        <div className="
        bg-gradient-to-br from-[#2d1b69] via-[#3b82f6]/80 to-[#60a5fa]/70
        border border-[#3b82f6]/50 
        shadow-[0_0_25px_rgba(59,130,246,0.35)]
        hover:shadow-[0_0_40px_rgba(59,130,246,0.45)]
        hover:scale-[1.02]
        transition-all duration-300
        rounded-2xl p-6 flex flex-col items-center
    ">
                            <div className="text-4xl font-bold text-white drop-shadow-md">
                                {pastEvents.length}
                            </div>
                            <div className="text-gray-100 text-sm mt-2">
                                Kaçırdığı Etkinlik Sayısı
                            </div>
                        </div>

                    </div>





                    {/* Name */}
                    <div className="
    bg-gradient-to-br from-[#1b1c2e]/60 via-[#151627]/70 to-[#0f1020]/90
    border border-[#3b82f6]/40
    shadow-[0_0_25px_rgba(0,0,0,0.25)]
    hover:shadow-[0_0_45px_rgba(59,130,246,0.25)]
    transition-all duration-300
    hover:scale-[1.01]
    rounded-2xl p-8 mb-8
">
                        <h2 className="text-3xl font-bold text-white mb-2">{profile.name} {profile.surname}</h2>
                        <p className="text-gray-300 text-lg">{profile.email}</p>
                    </div>



                   
                    

                    <div className="
    bg-gradient-to-br from-[#1b1c2e]/60 via-[#151627]/70 to-[#0f1020]/90
    border border-[#3b82f6]/40
    shadow-[0_0_25px_rgba(0,0,0,0.25)]
    hover:shadow-[0_0_45px_rgba(59,130,246,0.25)]
    transition-all duration-300
    hover:scale-[1.01]
    rounded-2xl p-8 mb-8
">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 flex items-center justify-center rounded-xl 
            bg-gradient-to-br from-[#2d1b69] to-[#3b82f6] text-white text-3xl shadow-lg">
                                🎓
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-[#3b82f6]">Bölüm</h3>
                                <p className="text-gray-200 text-lg mt-1">{profile.departmentName ?? "Bilinmiyor"}</p>
                            </div>
                        </div>
                    </div>


                    {/* Clubs */}
                    <div className="bg-[#0f0f1a] border border-[#3b82f6]/30 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-[#3b82f6] mb-4">
                            Üyesi Olduğum Kulüpler
                        </h3>

                        {profile.clubs && profile.clubs.length > 0 ? (
                            <div className="space-y-4">
                                {profile.clubs
                                    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                                    .map((club) => {
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
        flex items-center justify-between gap-4
    "
                                            >
                                                {/* İKON + METİN */}
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`
                w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center 
                bg-gradient-to-br ${iconData.color}
                shadow-[0_0_15px_rgba(255,255,255,0.15)]
            `}
                                                    >
                                                        <span className="text-white text-xl">{iconData.icon}</span>
                                                    </div>

                                                    <div>
                                                        <h2 className="text-xl font-semibold text-white">{club.name}</h2>
                                                        <p className="text-gray-300 text-sm">{club.departmentName}</p>
                                                        <p className="text-gray-200 text-sm mt-1 leading-relaxed">
                                                            {club.description || "Açıklama bulunmuyor."}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* AYRIL BUTONU — SAYFA STİLİNE UYUMLU MAVİ/MOR */}
                                                <button
                                                    onClick={() => handleLeaveClub(club.id)}
                                                    className="
            px-5 py-2 rounded-xl font-semibold text-white
            bg-gradient-to-r from-[#3b82f6] to-[#4f46e5]
            shadow-[0_4px_14px_rgba(59,130,246,0.45)]
            hover:from-[#60a5fa] hover:to-[#6d5cff]
            transition-all duration-300 hover:scale-105
        "
                                                >
                                                    Ayrıl
                                                </button>
                                            </div>


                                        );
                                    })}
                            </div>
                        ) : (
                            <p className="text-gray-400">Henüz üye olduğunuz kulüp bulunmamaktadır.</p>
                        )}

                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                        Profil bilgileri yükleniyor...
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
