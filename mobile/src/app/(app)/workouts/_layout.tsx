import { Stack } from "expo-router";
import { Header } from "@/components/header";

export default function WorkoutsLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitle: (props) => {
                    return <Header title={props.children} />;
                },
            }}
        >
            <Stack.Screen name="index" options={{ title: "Workouts" }} />
            <Stack.Screen name="create" options={{ title: "Create Workout" }} />
            <Stack.Screen name="[id]" options={{ title: "Edit Workout" }} />
        </Stack>
    );
}
