import { View, Text, TouchableOpacity } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useThemeColors } from "@/hooks/useThemeColors";
import { WorkoutTemplate } from "@/types";

type TemplateListItemProps = {
    template: WorkoutTemplate;
    onPress: (id: number) => void;
    onOptions: (id: number) => void;
};

export default function TemplateListItem({
    template,
    onPress,
    onOptions,
}: TemplateListItemProps) {
    const themeColors = useThemeColors();

    return (
        <TouchableOpacity
            className="bg-background rounded-2xl p-4 mb-4 flex-row justify-between shadow-md border border-border"
            onPress={() => onPress(template.id)}
        >
            <View className="flex-1">
                <Text className="text-foreground font-bold text-xl">
                    {template.name}
                </Text>
                {template.notes && (
                    <Text className="text-muted-foreground mt-1">
                        {template.notes}
                    </Text>
                )}
            </View>

            <TouchableOpacity
                onPress={() => onOptions(template.id)}
                className="w-10"
            >
                <SimpleLineIcons
                    name="options"
                    className="my-auto ml-auto"
                    size={20}
                    color={themeColors.foreground}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}
