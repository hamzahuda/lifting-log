import { Stack } from "expo-router";
const colors = require("@/styles/colors");

export default function WorkoutsLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.header,
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
