import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/card";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Workout } from "@/types";

type WorkoutListItemProps = {
    workout: Workout;
    index: number;
    totalCount: number;
    onPress: (id: number) => void;
    onOptions: (id: number) => void;
};

export default function WorkoutListItem({
    workout,
    index,
    totalCount,
    onPress,
    onOptions,
}: WorkoutListItemProps) {
    const themeColors = useThemeColors();

    return (
        <Card key={workout.id} className="pr-4 py-3 mb-3">
            <TouchableOpacity
                onPress={() => {
                    onPress(workout.id);
                }}
            >
                <View className="flex-row items-center">
                    <Text className="text-foreground font-bold text-center text-2xl px-6">
                        {`${totalCount - index}`}
                    </Text>
                    <View className="flex-col flex-1">
                        <View className="flex-row items-center">
                            <Text className="text-foreground font-bold text-2xl flex-1">
                                {workout.name}
                            </Text>
                            <Text className="text-foreground font-semibold text-lg">
                                {new Date(workout.date).toLocaleDateString(
                                    "en-GB",
                                )}
                            </Text>
                        </View>
                        <Text className="text-muted-foreground flex-1">
                            {workout.notes || ""}
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="ml-4"
                        onPress={() => onOptions(workout.id)}
                    >
                        <SimpleLineIcons
                            name="options"
                            className="my-auto ml-auto"
                            size={20}
                            color={themeColors.foreground}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Card>
    );
}
