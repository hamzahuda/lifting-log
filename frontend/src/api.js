import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

// This interceptor handles 401 errors and refreshes the token
api.interceptors.response.use(
    function onFulfilled(response) {
        return response;
    },
    async function onRejected(error) {
        const originalRequest = error.config;

        // If error is 401 and it's the first try
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN);
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/token/refresh/`,
                    {
                        refresh: refreshToken,
                    }
                );

                if (res.status === 200) {
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    api.defaults.headers.Authorization = `Bearer ${res.data.access}`;
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    // Do the api call again with the new access token
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                // logout after failing to refresh access token
                window.location.href = "/logout";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
