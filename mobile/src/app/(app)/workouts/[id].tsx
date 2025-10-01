import { useState, useEffect } from "react";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "@/utils/api";
import ExerciseCard from "./_components/ExerciseCard";
import { Workout } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        api.get(`/workouts/${id}/`)
            .then((res) => {
                const fetchedWorkout = res.data;
                setWorkout(fetchedWorkout);
                setOriginalWorkout(structuredClone(fetchedWorkout));
            })
            .catch((err) => {
                console.error("Failed to fetch workout:", err);
                Alert.alert("Error", "Could not load workout details.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

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
        if (!workout) return;

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
            <SafeAreaView className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    if (!workout) {
        return (
            <SafeAreaView
                edges={["left", "right", "top"]}
                className="flex-1 justify-center items-center bg-background"
            >
                <Text className="text-white">Workout not found.</Text>
            </SafeAreaView>
        );
    }

    const hasChanges =
        JSON.stringify(workout) !== JSON.stringify(originalWorkout);

    const workoutDate = new Date(workout.date + "T00:00:00").toLocaleDateString(
        "en-UK",
        {
            year: "numeric",
            month: "short",
            day: "2-digit",
        }
    );

    return (
        <SafeAreaView
            edges={["left", "right", "top"]}
            className="flex-1 bg-background"
        >
            <ScrollView
                className="p-5"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Text className="text-4xl text-white font-bold text-center mb-1">
                    {workout.name}
                </Text>
                <Text className="text-lg text-center text-gray-400 font-bold">
                    {workoutDate}
                </Text>
                {workout.notes && (
                    <Text className="text-gray-500 mb-4 text-center">
                        ({workout.notes})
                    </Text>
                )}

                {workout.exercises.map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        exerciseIndex={index}
                        onSetUpdate={handleSetUpdate}
                    />
                ))}
            </ScrollView>

            {hasChanges && (
                <View className="absolute bottom-0 left-0 right-0 p-5 bg-background border-t border-gray-700">
                    <TouchableOpacity
                        onPress={handleSaveChanges}
                        disabled={isSaving}
                        accessibilityLabel="Save workout changes"
                        accessibilityRole="button"
                        className={`py-4 rounded-xl ${
                            isSaving ? "bg-gray-500" : "bg-blue-600"
                        }`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">
                                Save Changes
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
