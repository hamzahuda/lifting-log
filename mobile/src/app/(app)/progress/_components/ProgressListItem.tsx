import { View, Text, TouchableOpacity } from "react-native";

type TemplateListItemProps = {
    exercise_name: string;
    onPress: (name: string) => void;
};

export default function ProgressListItem({
    exercise_name,
    onPress,
}: TemplateListItemProps) {
    return (
        <TouchableOpacity
            className="bg-background rounded-2xl p-4 mb-4 flex-row justify-between shadow-md border border-border"
            onPress={() => onPress(exercise_name)}
        >
            <View className="flex-1">
                <Text className="text-foreground font-bold text-xl">
                    {exercise_name}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
