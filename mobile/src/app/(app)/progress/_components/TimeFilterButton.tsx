import { Text, TouchableOpacity } from "react-native";
import { TimeRange } from "@/types";

interface TimeFilterButtonProps {
    range: TimeRange;
    active: boolean;
    onPress: (range: TimeRange) => void;
}

export default function TimeFilterButton({
    range,
    active,
    onPress,
}: TimeFilterButtonProps) {
    return (
        <TouchableOpacity
            onPress={() => onPress(range)}
            className={`px-3 py-1 rounded-full mx-1 ${
                active ? "bg-primary" : "bg-secondary"
            }`}
        >
            <Text
                className={`text-xs font-bold ${
                    active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
            >
                {range}
            </Text>
        </TouchableOpacity>
    );
}
