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
        />
    );
}
