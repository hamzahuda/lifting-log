export interface Set {
    id: number;
    reps: number | null;
    weight: number | null;
    min_reps: number;
    max_reps: number;
    notes: string;
}

export interface Exercise {
    id: number;
    name: string;
    notes: string;
    sets: Set[];
}

export interface Workout {
    id: number;
    name: string;
    date: string;
    notes: string;
    exercises: Exercise[];
}

export interface SetTemplate {
    id: string;
    notes: string;
    min_reps: number;
    max_reps: number;
}

export interface ExerciseTemplate {
    id: string;
    name: string;
    rest_period: string;
    notes: string;
    set_templates: SetTemplate[];
}

export interface WorkoutTemplate {
    id: number;
    date: string;
    name: string;
    notes: string;
    exercise_templates: ExerciseTemplate[];
}
