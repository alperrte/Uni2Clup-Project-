import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

// Token otomatik eklenir
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Pasif kullanýcý otomatik logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 403 &&
            error.response?.data === "SUSPENDED"
        ) {
            localStorage.clear();
            window.location.href = "/suspended";
        }
        return Promise.reject(error);
    }
);

export default api;
