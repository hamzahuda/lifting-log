import { Stack } from "expo-router";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);

export default function TemplatesLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: fullConfig.theme.colors.blue[900],
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
