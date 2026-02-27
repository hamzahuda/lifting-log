export type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y" | "All";

// --- Workouts ---

export type Set = {
    readonly id: number;
    reps: string | null;
    weight: string | null;
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

// --- Templates ---

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

// --- Custom Exercises ---

export type RemoteCustomExercise = {
    readonly id: number;
    name: string;
};

// --- Exercise Goals ---

export type ExerciseGoal = {
    readonly id: number;
    exercise_name: string;
    goal_weight: number;
    created_at: string;
    updated_at: string;
};
