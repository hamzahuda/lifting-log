import axios, { InternalAxiosRequestConfig } from "axios";
import { supabase } from "./supabase";
import {
    Workout,
    WorkoutTemplate,
    Exercise,
    WorkoutTemplateFormData,
    RemoteCustomExercise,
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
    },
);

// ===================================
// API Service Layer
// ===================================

// --- Workouts ---

export const fetchWorkoutList = async () => {
    const response = await api.get<Workout[]>("/workouts/");
    return response;
};

export const fetchWorkout = async (id: number | string) => {
    const response = await api.get<Workout>(`/workouts/${id}/`);
    return response;
};

export const createWorkout = async (template_url: string, date: Date) => {
    const response = await api.post<Workout>("/workouts/", {
        template: template_url,
        date: date.toISOString(),
    });
    return response;
};

export const updateWorkout = async (id: number | string, data: Workout) => {
    const response = await api.put<Workout>(`/workouts/${id}/`, data);
    return response;
};

export const updateWorkoutDate = async (id: number | string, date: Date) => {
    const response = await api.patch<Workout>(`/workouts/${id}/`, {
        date: date.toISOString(),
    });
    return response;
};

export const deleteWorkout = async (id: number | string) => {
    await api.delete(`/workouts/${id}/`);
};

// --- Workout Templates ---

export const fetchTemplateList = async () => {
    const response = await api.get<WorkoutTemplate[]>("/workout-templates/");
    return response;
};

export const fetchTemplate = async (id: number | string) => {
    const response = await api.get<WorkoutTemplate>(
        `/workout-templates/${id}/`,
    );
    return response;
};

export const createTemplate = async (data: WorkoutTemplateFormData) => {
    const response = await api.post<WorkoutTemplate>(
        "/workout-templates/",
        data,
    );
    return response;
};

export const updateTemplate = async (
    id: number | string,
    data: WorkoutTemplateFormData,
) => {
    const response = await api.put<WorkoutTemplate>(
        `/workout-templates/${id}/`,
        data,
    );
    return response;
};

export const deleteTemplate = async (id: number | string) => {
    await api.delete(`/workout-templates/${id}/`);
};

export const duplicateTemplate = async (id: number | string) => {
    const response = await api.post(`/workout-templates/${id}/duplicate/`);
    return response;
};

// --- Exercises ---

export const fetchSingleExerciseHistory = async (exercise_name: string) => {
    const response = await api.get<Exercise[]>(
        "/exercises/single-exercise-history/",
        {
            params: {
                exercise_name,
            },
        },
    );
    return response;
};

export const fetchPerformedExercises = async () => {
    const response = await api.get<string[]>("/exercises/directory/");
    return response;
};

export const fetchLastExercisePerformance = async (
    name: string,
    workoutId: number,
) => {
    const response = await api.get<Exercise | null>(
        "/exercises/last-performance/",
        {
            params: {
                name: name,
                workout_id: workoutId,
            },
        },
    );
    return response;
};

// --- Custom Exercises ---

export const createBackendCustomExercise = async (name: string) => {
    const response = await api.post<RemoteCustomExercise>(
        "/custom-exercise-names/",
        {
            name,
        },
    );
    return response;
};

export const updateBackendCustomExercise = async (
    id: number | string,
    name: string,
) => {
    const response = await api.put<RemoteCustomExercise>(
        `/custom-exercise-names/${id}/`,
        {
            name,
        },
    );
    return response;
};

export const fetchBackendCustomExerciseList = async () => {
    const response = await api.get<RemoteCustomExercise[]>(
        "/custom-exercise-names/",
    );
    return response;
};

export const deleteBackendCustomExercise = async (id: number | string) => {
    await api.delete(`/custom-exercise-names/${id}/`);
};

// --- User ---

export const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}/`);
};
