export interface Set {
    readonly id: number;
    reps: number | null;
    weight: number | null;
    min_reps: number;
    max_reps: number;
    notes: string;
}

export interface Exercise {
    readonly id: number;
    name: string;
    rest_period: string;
    notes: string;
    sets: Set[];
}

export interface Workout {
    readonly id: number;
    name: string;
    date: string;
    notes: string;
    exercises: Exercise[];
}

export interface SetTemplate {
    readonly id: string;
    notes: string;
    min_reps: number;
    max_reps: number;
}

export interface ExerciseTemplate {
    readonly id: string;
    name: string;
    rest_period: string;
    notes: string;
    set_templates: SetTemplate[];
}

export interface WorkoutTemplate {
    readonly id: number;
    readonly url: string;
    name: string;
    notes: string;
    exercise_templates: ExerciseTemplate[];
}

export type WorkoutTemplateFormData = Omit<WorkoutTemplate, "id" | "url">;
