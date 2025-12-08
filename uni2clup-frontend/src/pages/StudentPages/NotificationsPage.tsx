import React from "react";

interface NotificationsPageProps {
    notifications: any[];
    handleMarkAsRead: (id: number) => void;
    formatDate: (date: string) => string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({
    notifications,
    handleMarkAsRead,
    formatDate
}) => {


   


    return (
        <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">Bildirimler</h1>
            <p className="text-gray-400 mb-8">Tüm bildirimleriniz</p>

            {notifications.length === 0 ? (
                <p className="text-gray-400 text-center mt-20">
                    Hiç bildiriminiz bulunmamaktadır.
                </p>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif: any) => (
                        <div
                            key={notif.id}
                            className="bg-gradient-to-r from-[#1a1a2e] to-[#2a2a3e]
                                       border border-[#3b82f6]/40 rounded-xl p-6 shadow-lg"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#3b82f6]">
                                        {notif.title}
                                    </h3>
                                    <p className="text-gray-300">{notif.message}</p>

                                    <p className="text-gray-500 text-sm mt-2">
                                        {formatDate(notif.createdAt)}
                                    </p>
                                </div>

                                {!notif.isRead && (
                                    <button
                                        className="text-blue-400 hover:text-blue-300 font-semibold"
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        Okundu İşaretle
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
