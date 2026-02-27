import { View, Text } from "react-native";
import { Exercise } from "@/types";
import { calculateOneRepMax } from "@/utils/one-rep-max";

interface LiftHistoryItemProps {
    item: Exercise;
}

export default function LiftHistoryItem({ item }: LiftHistoryItemProps) {
    const bestOneRepMax = Math.max(
        ...item.sets.map((s) =>
            calculateOneRepMax(Number(s.weight), Number(s.reps)),
        ),
    );

    return (
        <View className="flex-row justify-between items-center py-4 px-4 border-b border-muted/30">
            <View>
                <Text className="text-foreground font-semibold">
                    {new Date(item.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </Text>
                <Text className="text-muted-foreground text-xs">
                    {item.sets.length} {item.sets.length === 1 ? "Set" : "Sets"}{" "}
                    Total
                </Text>
            </View>
            <View className="flex-row items-baseline">
                <Text className="text-primary font-bold text-lg">
                    {bestOneRepMax}
                </Text>
                <Text className="text-muted-foreground ml-1 text-xs">
                    kg (est. 1RM)
                </Text>
            </View>
        </View>
    );
}
