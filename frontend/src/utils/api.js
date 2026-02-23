/**
 * Centralized Axios instance
 *
 * In Docker / production:  Nginx proxies /api/* → backend:5000
 * In local dev:            Vite proxy (vite.config.js) handles /api/* → localhost:5000
 *
 * This means we NEVER hardcode http://localhost:5000 anywhere.
 * All API calls use a relative base URL so they work in every environment.
 */
import axios from "axios";

const api = axios.create({
    baseURL: "/",          // relative — handled by Nginx proxy in Docker, Vite proxy in dev
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token automatically to every request if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
