import { View, Text } from "react-native";
import { Exercise } from "@/types";
import { useEffect, useState } from "react";
import { fetchLastExercisePerformance } from "@/services/api";
import SetRow from "./SetRow";

interface ExerciseCardProps {
    exercise: Exercise;
    onSetUpdate: (
        exerciseIndex: number,
        setIndex: number,
        field: "weight" | "reps",
        value: string,
    ) => void;
    exerciseIndex: number;
    workoutId: number;
    isLast?: boolean;
}

export default function ExerciseCard({
    exercise,
    onSetUpdate,
    exerciseIndex,
    workoutId,
    isLast,
}: ExerciseCardProps) {
    const [lastPerformance, setLastPerformance] = useState<Exercise | null>(
        null,
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
                    workoutId,
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
            !lastPerformance.sets[setIndex] ||
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
                    <SetRow
                        key={set.id}
                        set={set}
                        setIndex={setIndex}
                        exerciseIndex={exerciseIndex}
                        lastPerformanceSet={formatLastPerformanceSet(setIndex)}
                        isLoadingLastPerformance={isLoadingLastPerformance}
                        onSetUpdate={onSetUpdate}
                    />
                ))}
            </View>
        </View>
    );
}
