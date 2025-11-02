import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { ScrollView, View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "@/services/api";
import ExerciseCard from "./_components/ExerciseCard";
import { Workout } from "@/types";
import { Card } from "@/components/ui/card";
import useDebounce from "@/hooks/useDebounce";
import { useNavigation } from "expo-router";

export default function WorkoutDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(
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
                setWorkout(res.data);
                setOriginalWorkout(structuredClone(res.data));
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
        const numValue = value === "" ? null : parseInt(value);
        if (numValue !== null && isNaN(numValue)) {
            return;
        }

        setWorkout((currentWorkout) => {
            if (!currentWorkout) return null;

            const newExercises = [...currentWorkout.exercises];
            const newSets = [...newExercises[exerciseIndex].sets];

            newSets[setIndex] = { ...newSets[setIndex], [field]: numValue };
            newExercises[exerciseIndex] = {
                ...newExercises[exerciseIndex],
                sets: newSets,
            };
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
        <View className="flex-1 bg-background px-2">
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{
                    paddingBottom: 150,
                }}
                showsVerticalScrollIndicator={false}
            >
                {workout.notes && (
                    <Text className="text-gray-500 mb-4 text-center">
                        ({workout.notes})
                    </Text>
                )}
                <Card className="py-0 gap-0 px-4">
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
                                isLast={index === workout.exercises.length - 1}
                            />
                        </View>
                    ))}
                </Card>
            </ScrollView>
        </View>
    );
}
