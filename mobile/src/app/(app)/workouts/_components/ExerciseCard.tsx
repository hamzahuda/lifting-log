import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { Exercise } from "@/types";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import api from "@/services/api";
import { Exercise as ApiExercise, Set as ApiSet } from "@/types";

interface LocalSet extends Omit<ApiSet, "weight" | "reps"> {
    weight: string | null;
    reps: string | null;
}

interface LocalExercise extends Omit<ApiExercise, "sets"> {
    sets: LocalSet[];
}

interface ExerciseCardProps {
    exercise: LocalExercise;
    onSetUpdate: (
        exerciseIndex: number,
        setIndex: number,
        field: "weight" | "reps",
        value: string
    ) => void;
    exerciseIndex: number;
    workoutId: number;
    isLast?: boolean;
}

const ExerciseCard = ({
    exercise,
    onSetUpdate,
    exerciseIndex,
    workoutId,
    isLast,
}: ExerciseCardProps) => {
    const [progress, setProgress] = useState<number>(0);
    const [lastPerformance, setLastPerformance] = useState<Exercise | null>(
        null
    );
    const [isLoadingLastPerformance, setIsLoadingLastPerformance] =
        useState<boolean>(true);

    useEffect(() => {
        const completedSets = exercise.sets.filter(
            (set) => set.reps !== null
        ).length;
        const totalSets = exercise.sets.length;
        setProgress((totalSets > 0 ? completedSets / totalSets : 0) * 100);
    }, [exercise]);

    useEffect(() => {
        const fetchLastPerformance = async () => {
            if (!workoutId || !exercise.name) return;
            try {
                setIsLoadingLastPerformance(true);
                const response = await api.get<Exercise | null>(
                    "/exercises/last-performance/",
                    {
                        params: {
                            name: exercise.name,
                            workout_id: workoutId,
                        },
                    }
                );
                setLastPerformance(response.data);
            } catch (error) {
                console.error("Failed to fetch last performance:", error);
            } finally {
                setIsLoadingLastPerformance(false);
            }
        };

        fetchLastPerformance();
    }, []);

    const formatLastPerformanceSet = (setIndex: number) => {
        if (
            !lastPerformance ||
            !lastPerformance.sets ||
            lastPerformance.sets[setIndex].reps === null ||
            lastPerformance.sets[setIndex].weight === null
        )
            return "-";
        return `${lastPerformance.sets[setIndex].weight} x ${lastPerformance.sets[setIndex].reps}`;
    };

    return (
        <View className={`pt-4 ${!isLast ? "border-b border-gray-500" : ""}`}>
            <View className="flex-1">
                <Text className="text-card-foreground font-extrabold text-2xl">
                    {exercise.name.toUpperCase()}
                </Text>
                {exercise.notes && (
                    <Text className="text-muted-foreground text-sm align-top">
                        ({exercise.notes})
                    </Text>
                )}
                <Progress value={progress} className="mt-1" />
            </View>

            <View className="mt-4">
                <View className="flex-row border-b pb-2 mb-2 border-gray-500">
                    <Text className="w-12 text-muted-foreground text-center text-lg font-semibold">
                        SET
                    </Text>
                    <Text className="flex-1 text-muted-foreground text-center text-lg font-semibold">
                        PREVIOUS
                    </Text>
                    <Text className="flex-1 text-muted-foreground text-center text-lg font-semibold">
                        WEIGHT
                    </Text>
                    <Text className="flex-1 text-muted-foreground text-center text-lg font-semibold">
                        REPS
                    </Text>
                </View>

                {exercise.sets.map((set, setIndex) => (
                    <View
                        key={set.id}
                        className="flex-row py-1 mb-2 items-center"
                    >
                        <Text className="w-12 text-foreground text-lg text-center">
                            {setIndex + 1}
                        </Text>
                        <Text className="flex-1 text-muted-foreground text-lg text-center">
                            {isLoadingLastPerformance ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                formatLastPerformanceSet(setIndex)
                            )}
                        </Text>
                        <View className="flex-1 items-center">
                            <TextInput
                                className={`text-lg text-center w-16 py-1 bg-secondary rounded-md ${
                                    set.isWeightAutofilled
                                        ? "text-muted-foreground"
                                        : "text-foreground"
                                }`}
                                value={set.weight?.toString() ?? ""}
                                onChangeText={(value) =>
                                    onSetUpdate(
                                        exerciseIndex,
                                        setIndex,
                                        "weight",
                                        value
                                    )
                                }
                                keyboardType="numeric"
                                placeholder="--"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                        <View className="flex-1 items-center">
                            <TextInput
                                className="text-foreground text-lg text-center w-16 py-1 bg-secondary rounded-md"
                                value={set.reps?.toString() ?? ""}
                                onChangeText={(value) =>
                                    onSetUpdate(
                                        exerciseIndex,
                                        setIndex,
                                        "reps",
                                        value
                                    )
                                }
                                keyboardType="numeric"
                                placeholder={`${set.min_reps}-${set.max_reps}`}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default ExerciseCard;
