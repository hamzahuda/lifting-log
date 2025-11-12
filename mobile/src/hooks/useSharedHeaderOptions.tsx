import { useThemeColors } from "@/hooks/useThemeColors";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

export default function useSharedHeaderOptions(): ExtendedStackNavigationOptions {
    const themeColors = useThemeColors();

    return {
        headerStyle: {
            backgroundColor: themeColors.background,
        },
        headerTitleAlign: "center",
    };
}
