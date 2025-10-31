import { View, Text, TextInput, ActivityIndicator } from "react-native";
import { Exercise } from "@/types";
import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import api from "@/services/api";

interface ExerciseCardProps {
    exercise: Exercise;
    onSetUpdate: (
        exerciseIndex: number,
        setIndex: number,
        field: "weight" | "reps",
        value: string
    ) => void;
    exerciseIndex: number;
    workoutId: number;
    isLast?: boolean;
    onPress: () => void;
}

const ExerciseCard = ({
    exercise,
    onSetUpdate,
    exerciseIndex,
    workoutId,
    isLast,
    onPress,
}: ExerciseCardProps) => {
    const headers = ["Set", "Rep Range", "Weight (kg)", "Reps"];
    const [progress, setProgress] = useState<number>(0);
    const [lastPerformance, setLastPerformance] = useState<Exercise | null>(
        null
    );
    const [isLoadingLastPerformance, setIsLoadingLastPerformance] =
        useState<boolean>(true);

    useEffect(() => {
        const completedFields = exercise.sets.reduce((accumulator, set) => {
            return (
                accumulator +
                (set.reps !== null ? 1 : 0) +
                (set.weight !== null ? 1 : 0)
            );
        }, 0);
        const totalFields = exercise.sets.length * 2;
        setProgress(
            (totalFields > 0 ? completedFields / totalFields : 0) * 100
        );
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

    const renderLastPerformance = () => {
        if (isLoadingLastPerformance) {
            return <ActivityIndicator size="small" className="mb-2" />;
        }
        if (!lastPerformance) {
            return (
                <Text className="text-muted-foreground text-center mb-2 italic">
                    No previous data for {exercise.name}.
                </Text>
            );
        }

        const setsString = lastPerformance.sets
            .map((set) => `${set.weight ?? 0}kg x ${set.reps ?? 0}`)
            .join(", ");

        const formattedDate = new Date(lastPerformance.date).toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "numeric",
                year: "numeric",
            }
        );

        return (
            <View className="">
                <View className="flex-row flex-wrap">
                    <Text className="text-muted-foreground text-base">
                        {`${formattedDate}:  ${setsString}`}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Accordion type="single" collapsible>
            <AccordionItem
                value="item-1"
                className={isLast ? "border-b-0" : ""}
            >
                <AccordionTrigger onPress={onPress}>
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
                </AccordionTrigger>
                <AccordionContent>
                    <View className="flex-row border-b pb-2 mb-2 border-gray-500">
                        {headers.map((header) => (
                            <Text
                                key={header}
                                className="flex-1 text-muted-foreground text-center text-lg font-semibold"
                            >
                                {header}
                            </Text>
                        ))}
                    </View>

                    {exercise.sets.map((set, setIndex) => (
                        <View
                            key={set.id}
                            className="flex-row py-1 mb-2 items-center"
                        >
                            <Text className="flex-1 text-foreground text-lg text-center">
                                {setIndex + 1}
                            </Text>
                            <Text className="flex-1 text-foreground text-lg text-center">
                                {set.min_reps}-{set.max_reps}
                            </Text>
                            <View className="flex-1 items-center">
                                <TextInput
                                    className="text-foreground text-lg text-center w-16 py-1 bg-secondary rounded-md"
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
                                    placeholder="--"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    ))}
                    {renderLastPerformance()}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default ExerciseCard;
