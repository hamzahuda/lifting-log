import { useColorScheme } from "nativewind";
import { THEME } from "@/utils/theme";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

export default function useSharedHeaderOptions(): ExtendedStackNavigationOptions {
    const { colorScheme } = useColorScheme();
    const themeColors =
        colorScheme === undefined ? THEME.dark : THEME[colorScheme];

    return {
        headerStyle: {
            backgroundColor: themeColors.background,
        },
        headerTitleAlign: "center",
    };
}
