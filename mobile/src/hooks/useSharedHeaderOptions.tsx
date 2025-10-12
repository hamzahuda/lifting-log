import { useColorScheme } from "nativewind";
import { THEME } from "@/utils/theme";

export default function useSharedHeaderOptions() {
    const { colorScheme } = useColorScheme();
    const themeColors =
        colorScheme === undefined ? THEME.dark : THEME[colorScheme];

    return {
        headerStyle: {
            backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.foreground,
        headerTitleStyle: {
            fontSize: 26,
        },
        headerTitleAlign: "center" as const,
    };
}
