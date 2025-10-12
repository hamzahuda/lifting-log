import { Stack } from "expo-router";
import useSharedHeaderOptions from "@/hooks/useSharedHeaderOptions";

export default function WorkoutsLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitle: "Workouts",
                ...useSharedHeaderOptions(),
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
