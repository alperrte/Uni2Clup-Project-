// ProfilePage.tsx
import React from "react";

interface ClubItem {
    id: number;
    name: string;
    departmentName?: string;
}

interface ProfileData {
    name: string;
    surname: string;
    email: string;
    departmentName?: string;
    clubs?: ClubItem[];
}

interface ClubIconData {
    icon: React.ReactNode;
    color: string;
}

interface ProfilePageProps {
    profile: ProfileData | null;
    getClubIcon: (clubName: string) => ClubIconData;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, getClubIcon }) => {
    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Profil</h1>
            <p className="text-gray-400 mb-8">Kişisel bilgileriniz</p>

            {profile ? (
                <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e]
                                border border-[#3b82f6]/40 rounded-xl p-8 shadow-xl">

                    {/* Avatar */}
                    <div className="w-24 h-24 bg-gradient-to-br from-[#2d1b69] to-[#3b82f6]
                                    rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-3xl">
                            {profile.name.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* Name */}
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        {profile.name} {profile.surname}
                    </h2>

                    <p className="text-gray-300 text-center">{profile.email}</p>

                    {/* Department */}
                    <div className="bg-[#0f0f1a] border border-[#3b82f6]/30 rounded-lg p-4 my-6">
                        <h3 className="text-lg font-semibold text-[#3b82f6] mb-2">
                            Bölüm
                        </h3>
                        <p className="text-white">
                            {profile.departmentName ?? "Bilinmiyor"}
                        </p>
                    </div>

                    {/* Clubs */}
                    <div className="bg-[#0f0f1a] border border-[#3b82f6]/30 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-[#3b82f6] mb-4">
                            Üyesi Olduğum Kulüpler
                        </h3>

                        {profile.clubs && profile.clubs.length > 0 ? (
                            <div className="space-y-2">
                                {profile.clubs.map((club) => {
                                    const iconData = getClubIcon(club.name);

                                    return (
                                        <div
                                            key={club.id}
                                            className="flex items-center space-x-3
                                                       p-3 bg-[#1a1a2e] rounded-lg border border-[#3b82f6]/20"
                                        >
                                            <div
                                                className={`w-10 h-10 bg-gradient-to-br ${iconData.color}
                                                            rounded-full flex items-center justify-center text-lg`}
                                            >
                                                {iconData.icon}
                                            </div>

                                            <div className="flex-1">
                                                <p className="text-white font-medium">
                                                    {club.name}
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    {club.departmentName}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400">
                                Henüz üye olduğunuz kulüp bulunmamaktadır.
                            </p>
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
