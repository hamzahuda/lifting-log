import { Stack } from "expo-router";
import { useSharedHeaderOptions } from "../_utils/useSharedHeaderOptions";

export default function TemplatesLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitle: "Workout Templates",
                ...useSharedHeaderOptions(),
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
