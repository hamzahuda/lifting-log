import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Set } from "@/types";
import SetInput from "./SetInput";
import { Trash2 } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

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
        value: string,
    ) => void;
    isEditing: boolean;
    onDeleteSet: (exerciseIndex: number, setIndex: number) => void;
}

export default function SetRow({
    set,
    setIndex,
    exerciseIndex,
    lastPerformanceSet,
    isLoadingLastPerformance,
    onSetUpdate,
    isEditing,
    onDeleteSet,
}: SetRowProps) {
    const handleWeightChange = (value: string) => {
        onSetUpdate(exerciseIndex, setIndex, "weight", value);
    };

    const handleRepsChange = (value: string) => {
        onSetUpdate(exerciseIndex, setIndex, "reps", value);
    };

    return (
        <View className="flex-row py-1 mb-2 items-center">
            <View className="flex-1 flex-row items-center">
                <Text className="w-12 text-foreground text-lg text-center">
                    {setIndex + 1}
                </Text>
                <View className="flex-1 justify-center items-center">
                    {isLoadingLastPerformance ? (
                        <ActivityIndicator size="small" />
                    ) : (
                        <Text
                            className="text-muted-foreground text-lg text-center"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {lastPerformanceSet}
                        </Text>
                    )}
                </View>
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

            {isEditing && (
                <View className="w-6 items-center justify-center">
                    <TouchableOpacity
                        onPress={() => onDeleteSet(exerciseIndex, setIndex)}
                    >
                        <Icon as={Trash2} size={20} className="text-red-500" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
