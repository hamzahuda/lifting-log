import axios, { InternalAxiosRequestConfig } from "axios";
import { supabase } from "./supabase";
import {
    Workout,
    WorkoutTemplate,
    Exercise,
    WorkoutTemplateFormData,
} from "@/types";

export const api = axios.create({
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

// ===================================
// API Service Layer
// ===================================

// --- Workouts ---

export const fetchWorkoutList = async (): Promise<Workout[]> => {
    const response = await api.get<Workout[]>("/workouts/");
    return response.data;
};

export const fetchWorkout = async (id: number | string): Promise<Workout> => {
    const response = await api.get<Workout>(`/workouts/${id}/`);
    return response.data;
};

export const createWorkout = async (
    template_url: string,
    date: Date
): Promise<Workout> => {
    const response = await api.post<Workout>("/workouts/", {
        template: template_url,
        date: date.toISOString(),
    });
    return response.data;
};

export const updateWorkout = async (
    id: number | string,
    data: Workout
): Promise<Workout> => {
    const response = await api.put<Workout>(`/workouts/${id}/`, data);
    return response.data;
};

export const deleteWorkout = async (id: number | string): Promise<void> => {
    await api.delete(`/workouts/${id}/`);
};

// --- Workout Templates ---

export const fetchTemplateList = async (): Promise<WorkoutTemplate[]> => {
    const response = await api.get<WorkoutTemplate[]>("/workout-templates/");
    return response.data;
};

export const fetchTemplate = async (
    id: number | string
): Promise<WorkoutTemplate> => {
    const response = await api.get<WorkoutTemplate>(
        `/workout-templates/${id}/`
    );
    return response.data;
};

export const createTemplate = async (
    data: WorkoutTemplateFormData
): Promise<WorkoutTemplate> => {
    const response = await api.post<WorkoutTemplate>(
        "/workout-templates/",
        data
    );
    return response.data;
};

export const updateTemplate = async (
    id: number | string,
    data: WorkoutTemplateFormData
): Promise<WorkoutTemplate> => {
    const response = await api.put<WorkoutTemplate>(
        `/workout-templates/${id}/`,
        data
    );
    return response.data;
};

export const deleteTemplate = async (id: number | string): Promise<void> => {
    await api.delete(`/workout-templates/${id}/`);
};

export const duplicateTemplate = async (id: number | string): Promise<void> => {
    await api.post(`/workout-templates/${id}/duplicate/`);
};

// --- Exercises ---

export const fetchLastExercisePerformance = async (
    name: string,
    workoutId: number
): Promise<Exercise | null> => {
    const response = await api.get<Exercise | null>(
        "/exercises/last-performance/",
        {
            params: {
                name: name,
                workout_id: workoutId,
            },
        }
    );
    return response.data;
};
