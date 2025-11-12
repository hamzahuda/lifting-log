import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "@/hooks/useThemeColors";

type ModalActionRowProps = {
    text: string;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    isDestructive?: boolean;
    centred?: boolean;
};

export default function ModalActionRow({
    text,
    icon,
    onPress,
    isDestructive = false,
    centred = false,
}: ModalActionRowProps) {
    const themeColors = useThemeColors();

    const textColor = isDestructive
        ? "text-red-600 dark:text-red-500"
        : "text-gray-800 dark:text-gray-100";

    return (
        <TouchableOpacity
            className={`${centred ? "mx-auto" : ""} flex-row items-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700`}
            onPress={onPress}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={22}
                    color={themeColors.foreground}
                    className="mr-4"
                />
            )}

            <Text className={`text-lg ${textColor}`}>{text}</Text>
        </TouchableOpacity>
    );
}
