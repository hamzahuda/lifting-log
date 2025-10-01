import { Stack } from "expo-router";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

export default function WorkoutsLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: fullConfig.theme.colors.blue[900],
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
