import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { Exercise } from "@/types";
import { useEffect, useState } from "react";
import { fetchLastExercisePerformance } from "@/services/api";
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
    const [lastPerformance, setLastPerformance] = useState<Exercise | null>(
        null
    );
    const [isLoadingLastPerformance, setIsLoadingLastPerformance] =
        useState<boolean>(true);

    useEffect(() => {
        const fetchLastPerformance = async () => {
            if (!workoutId || !exercise.name) return;
            try {
                setIsLoadingLastPerformance(true);
                const res = await fetchLastExercisePerformance(
                    exercise.name,
                    workoutId
                );
                setLastPerformance(res.data);
            } catch (error) {
                console.error(error);
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
        <View
            className={`pt-4 border-t ${isLast ? "border-b" : ""} border-gray-500`}
        >
            <View className="flex-1">
                <Text className="text-card-foreground font-extrabold text-2xl">
                    {exercise.name.toUpperCase()}
                </Text>
                {exercise.notes && (
                    <Text className="text-muted-foreground text-sm align-top">
                        ({exercise.notes})
                    </Text>
                )}
            </View>

            <View className="mt-4 mb-2">
                <View className="flex-row pb-2 border-gray-500">
                    <Text className="w-12 text-muted-foreground text-center text-lg font-semibold">
                        SET
                    </Text>
                    <Text className="flex-1 text-muted-foreground text-center text-lg font-semibold">
                        PREVIOUS
                    </Text>
                    <Text className="w-24 text-muted-foreground text-center text-lg font-semibold">
                        WEIGHT
                    </Text>
                    <Text className="w-24 text-muted-foreground text-center text-lg font-semibold">
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
                        <View className="w-24 items-center">
                            <TextInput
                                className="text-lg text-center w-16 py-1 bg-secondary rounded-md text-foreground"
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
                        <View className="w-24 items-center">
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
