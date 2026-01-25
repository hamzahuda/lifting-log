import { View, Text, TouchableOpacity } from "react-native";

type TemplateListItemProps = {
    exercise: string;
    onPress: (name: string) => void;
};

export default function ProgressListItem({
    exercise,
    onPress,
}: TemplateListItemProps) {
    return (
        <TouchableOpacity
            className="bg-background rounded-2xl p-4 mb-4 flex-row justify-between shadow-md border border-border"
            onPress={() => onPress(exercise)}
        >
            <View className="flex-1">
                <Text className="text-foreground font-bold text-xl">
                    {exercise}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
