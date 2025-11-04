import { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "@/services/api";
import ExerciseCard from "./_components/ExerciseCard";
import { Card } from "@/components/ui/card";
import useDebounce from "@/hooks/useDebounce";
import { useNavigation } from "expo-router";
import {
    Workout as ApiWorkout,
    Exercise as ApiExercise,
    Set as ApiSet,
} from "@/types";

interface LocalSet extends Omit<ApiSet, "weight" | "reps"> {
    weight: string | null;
    reps: string | null;
}

interface LocalExercise extends Omit<ApiExercise, "sets"> {
    sets: LocalSet[];
}

interface LocalWorkout extends Omit<ApiWorkout, "exercises"> {
    exercises: LocalExercise[];
}

export default function WorkoutDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<LocalWorkout | null>(null);
    const [originalWorkout, setOriginalWorkout] = useState<LocalWorkout | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const itemLayouts = useRef<{ [key: number]: number }>({});
    const isInitialLoad = useRef(true);
    const debouncedWorkout = useDebounce(workout, 500);
    const navigation = useNavigation();

    // Makes the title blank while it loads
    useLayoutEffect(() => {
        navigation.setOptions({ title: "" });
    }, [navigation]);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.get(`/workouts/${id}/`)
            .then((res) => {
                const apiData = res.data as ApiWorkout;

                const localData: LocalWorkout = {
                    ...apiData,
                    exercises: apiData.exercises.map((exercise) => ({
                        ...exercise,
                        sets: exercise.sets.map((set) => ({
                            ...set,
                            weight: set.weight?.toString() ?? null,
                            reps: set.reps?.toString() ?? null,
                        })),
                    })),
                };

                setWorkout(localData);
                setOriginalWorkout(structuredClone(localData));
            })
            .catch((err) => {
                Alert.alert("Error", "Could not load workout details.");
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    useLayoutEffect(() => {
        if (workout) {
            const workoutDate = new Date(workout.date).toLocaleDateString(
                "en-GB",
                {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                }
            );
            navigation.setOptions({
                title: `${workout.name} - ${workoutDate}`,
            });
        }
    }, [navigation, workout]);

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        const hasChanges =
            JSON.stringify(workout) !== JSON.stringify(originalWorkout);

        if (workout && hasChanges) {
            handleSaveChanges();
        }
    }, [debouncedWorkout]);

    const handleSetUpdate = (
        exerciseIndex: number,
        setIndex: number,
        field: "weight" | "reps",
        value: string
    ) => {
        // Regex to allow only number.number
        const validPattern = /^(\d+\.?\d*)?$/;

        if (!validPattern.test(value)) {
            return;
        }

        setWorkout((currentWorkout) => {
            if (!currentWorkout) return null;

            const newExercises = currentWorkout.exercises.map(
                (exercise, exIndex) => {
                    if (exIndex !== exerciseIndex) {
                        return exercise;
                    }
                    const newSets = exercise.sets.map((set) => ({ ...set }));
                    const newValue = value === "" ? null : value;

                    if (field === "weight") {
                        newSets[setIndex].weight = newValue;
                        newSets[setIndex].isWeightAutofilled = false;

                        if (setIndex === 0) {
                            for (let i = 1; i < newSets.length; i++) {
                                if (
                                    newSets[i].weight === null ||
                                    newSets[i].isWeightAutofilled
                                ) {
                                    newSets[i].weight = newValue;
                                    newSets[i].isWeightAutofilled = true;
                                }
                            }
                        }
                    } else if (field === "reps") {
                        newSets[setIndex].reps = newValue;
                    }

                    return { ...exercise, sets: newSets };
                }
            );

            return { ...currentWorkout, exercises: newExercises };
        });
    };

    const handleSaveChanges = () => {
        if (!workout || isSaving) return;

        setIsSaving(true);

        api.put(`/workouts/${id}/`, workout)
            .then(() => {
                setOriginalWorkout(structuredClone(workout));
            })
            .catch((err) => {
                console.error("Failed to save workout:", err);
                Alert.alert(
                    "Error",
                    "Could not save changes. Please try again."
                );
            })
            .finally(() => {
                setIsSaving(false);
            });
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!workout) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <Text className="text-t-primary">Workout not found.</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={100}
        >
            <View className="flex-1 bg-background px-2">
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{
                        paddingBottom: 150,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                >
                    {workout.notes && (
                        <Text className="text-gray-500 mb-4 text-center">
                            ({workout.notes})
                        </Text>
                    )}
                    <View className="py-0 gap-0 px-4">
                        {workout.exercises.map((exercise, index) => (
                            <View
                                key={exercise.id}
                                onLayout={(event) => {
                                    itemLayouts.current[index] =
                                        event.nativeEvent.layout.y;
                                }}
                            >
                                <ExerciseCard
                                    exercise={exercise}
                                    exerciseIndex={index}
                                    workoutId={workout.id}
                                    onSetUpdate={handleSetUpdate}
                                    isLast={
                                        index === workout.exercises.length - 1
                                    }
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
