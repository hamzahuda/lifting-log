import { useColorScheme } from "nativewind";
import { THEME } from "@/utils/theme";

/**
 * A custom hook to get the active custom theme color object.
 */
export const useThemeColors = () => {
    const { colorScheme } = useColorScheme();
    return colorScheme === undefined ? THEME.dark : THEME[colorScheme];
};
