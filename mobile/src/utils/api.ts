import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// This interceptor handles 401 errors and refreshes the token
api.interceptors.response.use(
    (response) => response, // Return the response if it's successful
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        }; // Type assertion to add _retry property

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN);
                const res = await axios.post(
                    `${process.env.EXPO_PUBLIC_API_URL}/token/refresh/`,
                    {
                        refresh: refreshToken,
                    }
                );

                if (res.status === 200) {
                    await AsyncStorage.setItem(ACCESS_TOKEN, res.data.access);
                    api.defaults.headers.Authorization = `Bearer ${res.data.access}`;
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    // Do the api call again with the new access token
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token failed:", refreshError);
                // logout after failing to refresh access token
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
