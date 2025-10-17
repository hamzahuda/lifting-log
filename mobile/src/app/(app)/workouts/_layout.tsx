import { Stack } from "expo-router";
import { HeaderTitle } from "@/components/header-title";

export default function WorkoutsLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitle: (props) => {
                    return <HeaderTitle title={props.children} />;
                },
            }}
        >
            <Stack.Screen name="index" options={{ title: "Workouts" }} />
            <Stack.Screen name="create" options={{ title: "Create Workout" }} />
            <Stack.Screen name="[id]" options={{ title: "Edit Workout" }} />
        </Stack>
    );
}
