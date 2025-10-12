import { Stack } from "expo-router";
import { THEME } from "@/utils/theme";
import { useColorScheme } from "nativewind";

export default function WorkoutsLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor:
                        THEME[useColorScheme().colorScheme ?? "dark"]
                            .foreground,
                },
                headerTitle: "Workouts",
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 26,
                },
            }}
        >
            <Stack.Screen name="index" options={{ headerTitle: "Workouts" }} />
            <Stack.Screen
                name="create"
                options={{ headerTitle: "Create Workout" }}
            />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
