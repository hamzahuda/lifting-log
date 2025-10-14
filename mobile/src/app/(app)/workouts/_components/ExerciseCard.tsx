import { View, Text, TextInput } from "react-native";
import { Exercise } from "@/types";
import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

interface ExerciseCardProps {
    exercise: Exercise;
    onSetUpdate: (
        exerciseIndex: number,
        setIndex: number,
        field: "weight" | "reps",
        value: string
    ) => void;
    exerciseIndex: number;
    isLast?: boolean;
    onPress: () => void;
}

const ExerciseCard = ({
    exercise,
    onSetUpdate,
    exerciseIndex,
    isLast,
    onPress,
}: ExerciseCardProps) => {
    const headers = ["Set", "Rep Range", "Weight (kg)", "Reps"];
    const [progress, setProgress] = useState<number>(0);

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
                            className="flex-row py-1 items-center"
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
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default ExerciseCard;
