export type Set = {
    readonly id: number;
    reps: number | null;
    weight: number | null;
    min_reps: number;
    max_reps: number;
    notes: string;
    isWeightAutofilled?: boolean;
};

export type Exercise = {
    readonly id: number;
    name: string;
    rest_period: string;
    notes: string;
    sets: Set[];
    date: string;
};

export type Workout = {
    readonly id: number;
    name: string;
    date: string;
    notes: string;
    exercises: Exercise[];
};

export type SetTemplate = {
    readonly id: number;
    notes: string;
    min_reps: number;
    max_reps: number;
};

export type ExerciseTemplate = {
    readonly id: number;
    name: string;
    rest_period: string;
    notes: string;
    set_templates: SetTemplate[];
};

export type WorkoutTemplate = {
    readonly id: number;
    readonly url: string;
    name: string;
    notes: string;
    exercise_templates: ExerciseTemplate[];
};

export type WorkoutTemplateFormData = Omit<WorkoutTemplate, "id" | "url">;
