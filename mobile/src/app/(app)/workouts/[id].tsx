import { useState, useEffect, useRef } from "react";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "@/services/api";
import ExerciseCard from "./_components/ExerciseCard";
import { Workout } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/card";
import useDebounce from "@/hooks/useDebounce";

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

    const handleExercisePress = (index: number) => {
        const y = itemLayouts.current[index];
        if (scrollViewRef.current && y !== undefined) {
            scrollViewRef.current.scrollTo({ y: y, animated: true });
        }
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
                <Text className="text-t-primary">Workout not found.</Text>
            </SafeAreaView>
        );
    }

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
                ref={scrollViewRef}
                className="py-5 px-2"
                contentContainerStyle={{
                    paddingBottom: 150,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="text-4xl text-foreground font-bold text-center mb-1">
                    {workout.name}
                </Text>
                <Text className="text-lg text-center text-muted-foreground font-bold">
                    {workoutDate}
                </Text>
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
                                onPress={() => handleExercisePress(index)}
                            />
                        </View>
                    ))}
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
