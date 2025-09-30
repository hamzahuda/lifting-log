import { View, Text, TextInput } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { Exercise } from "@/types";
import { useEffect } from "react";

interface ExerciseCardProps {
    exercise: Exercise;
    onSetUpdate: (
        exerciseIndex: number,
        setIndex: number,
        field: "weight" | "reps",
        value: string
    ) => void;
    exerciseIndex: number;
}

const ExerciseCard = ({
    exercise,
    onSetUpdate,
    exerciseIndex,
}: ExerciseCardProps) => {
    const headers = ["Set", "Rep Range", "Weight (kg)", "Reps"];
    const progress = useSharedValue(0);

    useEffect(() => {
        const completedFields = exercise.sets.reduce((accumulator, set) => {
            return (
                accumulator +
                (set.reps !== null ? 1 : 0) +
                (set.weight !== null ? 1 : 0)
            );
        }, 0);
        const totalFields = exercise.sets.length * 2;
        progress.value = totalFields > 0 ? completedFields / totalFields : 0;
    }, [exercise]);

    const animatedProgressBar = useAnimatedStyle(() => ({
        width: withSpring(`${progress.value * 100}%`),
    }));

    return (
        <View className="bg-primary rounded-2xl p-4 mb-5 shadow-md shadow-black">
            <Text className="text-white font-extrabold text-3xl">
                {exercise.name.toUpperCase()}
            </Text>
            {exercise.notes && (
                <Text className="text-gray-500 text-sm align-top mb-2">
                    ({exercise.notes})
                </Text>
            )}

            <View className="h-2.5 w-full bg-gray-700 rounded-full overflow-hidden my-3">
                <Animated.View
                    style={animatedProgressBar}
                    className="h-full w-80 rounded-full bg-blue-500"
                />
            </View>

            <View className="flex-row border-b pb-2 mb-2 border-gray-500">
                {headers.map((header) => (
                    <Text
                        key={header}
                        className="flex-1 text-gray-400 text-center text-lg font-semibold"
                    >
                        {header}
                    </Text>
                ))}
            </View>

            {exercise.sets.map((set, setIndex) => (
                <View key={set.id} className="flex-row py-1 items-center">
                    <Text className="flex-1 text-gray-200 text-lg text-center">
                        {setIndex + 1}
                    </Text>
                    <Text className="flex-1 text-gray-200 text-lg text-center">
                        {set.min_reps}-{set.max_reps}
                    </Text>
                    <View className="flex-1 items-center">
                        <TextInput
                            className="text-gray-200 text-lg text-center w-16 py-1 bg-gray-700 rounded-md"
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
                            className="text-gray-200 text-lg text-center w-16 py-1 bg-gray-700 rounded-md"
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
        </View>
    );
};

export default ExerciseCard;
