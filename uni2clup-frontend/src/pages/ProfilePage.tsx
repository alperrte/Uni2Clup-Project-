// ProfilePage.tsx
import React from "react";

interface ClubItem {
    id: number;
    name: string;
    departmentName?: string;
    isMember?: boolean; // Opsiyonel ama filtrede kullanılmıyor
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
    getClubIcon: (clubName: string) => ClubIconData;
    handleLeaveClub: (clubId: number) => void;   // 🔥 EKLENECEK SATIR
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

                        {/* Toplam Kulüp Sayısı */}
                        <div className="bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6"
                        >
                            <div className="text-3xl font-bold text-white">
                                {profile?.clubs?.length ?? 0}
                            </div>
                            <div className="text-gray-300 text-sm">Üye Olduğu Kulüp Sayısı</div>
                        </div>

                        {/* Katıldığı Etkinlik Sayısı */}
                        <div className="bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6"
                        >
                            <div className="text-3xl font-bold text-white">
                                {myEvents.length}

                            </div>
                            <div className="text-gray-300 text-sm">Katıldığı Etkinlik Sayısı</div>
                        </div>

                        {/* Bildirim Sayısı */}
                        <div className="bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6"
                        >
                            <div className="text-3xl font-bold text-white">
                                {pastEvents.length}

                            </div>
                            <div className="text-gray-300 text-sm">Kaçırdığı Etkinlik Sayısı</div>
                        </div>

                    </div>



                    {/* Name */}
                    <div
                        className="bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6 mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-2">
                            {profile.name} {profile.surname}
                        </h2>

                        <p className="text-gray-200 text-lg">
                            {profile.email}
                        </p>
                    </div>


                   
                    

                    <div
                        className="bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6 mb-8"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="
                w-12 h-12 flex items-center justify-center rounded-lg
                bg-gradient-to-br from-[#2d1b69] to-[#3b82f6]
                text-white text-2xl shadow-lg
            "
                            >
                                🎓
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-[#3b82f6]">
                                    Bölüm
                                </h3>
                                <p className="text-gray-200 text-lg mt-1">
                                    {profile.departmentName ?? "Bilinmiyor"}
                                </p>
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
                                        const iconData = getClubIcon(club.name);

                                        return (
                                            <div
                                                key={club.id}
                                                className="bg-gradient-to-br from-[#1f1b4e] via-[#242050] to-[#1b1b3a]
           border border-[#3b82f6]/40 shadow-xl
           hover:shadow-[#3b82f6]/30 hover:scale-[1.01]
           transition-all duration-300 rounded-2xl p-6"
                                            >
                                                {/* İKON + METİN */}
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-xl
                                    bg-gradient-to-br ${iconData.color}
                                    shadow-lg
                                `}
                                                    >
                                                        {iconData.icon}
                                                    </div>

                                                    <div>
                                                        <p className="text-white text-lg font-semibold">
                                                            {club.name}
                                                        </p>
                                                        <p className="text-gray-400 text-sm">
                                                            {club.departmentName}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* AYRIL BUTONU */}
                                                <button
                                                    onClick={() => handleLeaveClub(club.id)}
                                                    className="
                                px-4 py-2
                                rounded-lg
                                bg-red-600 hover:bg-red-700
                                text-white font-medium
                                transition-all duration-300
                                hover:scale-105
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
