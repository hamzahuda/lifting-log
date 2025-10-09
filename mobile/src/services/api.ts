import axios, { InternalAxiosRequestConfig } from "axios";
import { supabase } from "./supabase"; // Import the supabase client

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Supabase handles refreshing tokens automatically,
// so we just need to attach the current access token to each request
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (session) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
