/**
 * Axios instance pre-configured to talk to the HopePath REST backend.
 * JWT is injected automatically from localStorage on every request.
 */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
});

// Attach JWT before every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// On 401, clear token so AuthContext redirects to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('hp_token');
        }
        return Promise.reject(err);
    }
);

export default api;
