import { Stack } from "expo-router";
import { HeaderTitle } from "@/components/header-title";
import useSharedHeaderOptions from "@/hooks/useSharedHeaderOptions";

export default function WorkoutsLayout() {
    const sharedHeaderOptions = useSharedHeaderOptions();

    return (
        <Stack
            screenOptions={{
                headerTitle: (props) => {
                    return <HeaderTitle title={props.children} />;
                },
                ...sharedHeaderOptions,
            }}
        >
            <Stack.Screen name="index" options={{ title: "Workouts" }} />
            <Stack.Screen name="create" options={{ title: "Create Workout" }} />
            <Stack.Screen name="[id]" options={{ title: "Edit Workout" }} />
        </Stack>
    );
}
