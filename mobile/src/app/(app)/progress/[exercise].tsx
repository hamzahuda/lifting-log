import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProgressDetailScreen() {
    const { exercise } = useLocalSearchParams<{ exercise: string }>();
    return <Text className="text-foreground">{exercise}</Text>;
}
