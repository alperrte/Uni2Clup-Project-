import * as React from "react";

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#2E4A7D]">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-sm text-center">
                <h1 className="text-3xl font-bold text-[#2E4A7D] mb-6">Uni2Clup</h1>

                <form className="flex flex-col space-y-4">
                    <input
                        type="email"
                        placeholder="E-posta"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E4A7D]"
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E4A7D]"
                    />
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
                    >
                        🔒 Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
}
