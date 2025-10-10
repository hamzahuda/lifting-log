import { Stack } from "expo-router";
import { THEME } from "@/rn-reusables/theme";
import { useColorScheme } from "nativewind";

export default function TemplatesLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor:
                        THEME[useColorScheme().colorScheme ?? "dark"]
                            .foreground,
                },
                headerTitle: "Workout Templates",
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 26,
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{ headerTitle: "Workout Templates" }}
            />
            <Stack.Screen
                name="create"
                options={{ headerTitle: "Create Template" }}
            />
            <Stack.Screen
                name="[id]"
                options={{ headerTitle: "Edit Template" }}
            />
        </Stack>
    );
}
