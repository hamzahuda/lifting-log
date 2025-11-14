import { View, Text, ActivityIndicator } from "react-native";
import { Set } from "@/types";
import SetInput from "./SetInput";

interface SetRowProps {
    set: Set;
    setIndex: number;
    exerciseIndex: number;
    lastPerformanceSet: string;
    isLoadingLastPerformance: boolean;
    onSetUpdate: (
        exerciseIndex: number,
        setIndex: number,
        field: "weight" | "reps",
        value: string
    ) => void;
}

export default function SetRow({
    set,
    setIndex,
    exerciseIndex,
    lastPerformanceSet,
    isLoadingLastPerformance,
    onSetUpdate,
}: SetRowProps) {
    const handleWeightChange = (value: string) => {
        onSetUpdate(exerciseIndex, setIndex, "weight", value);
    };

    const handleRepsChange = (value: string) => {
        onSetUpdate(exerciseIndex, setIndex, "reps", value);
    };

    return (
        <View className="flex-row py-1 mb-2 items-center">
            <Text className="w-12 text-foreground text-lg text-center">
                {setIndex + 1}
            </Text>
            <Text className="flex-1 text-muted-foreground text-lg text-center">
                {isLoadingLastPerformance ? (
                    <ActivityIndicator size="small" />
                ) : (
                    lastPerformanceSet
                )}
            </Text>
            <View className="w-24 items-center">
                <SetInput
                    value={set.weight?.toString() ?? ""}
                    onChangeText={handleWeightChange}
                    placeholder="--"
                />
            </View>
            <View className="w-24 items-center">
                <SetInput
                    value={set.reps?.toString() ?? ""}
                    onChangeText={handleRepsChange}
                    placeholder={`${set.min_reps}-${set.max_reps}`}
                />
            </View>
        </View>
    );
}
