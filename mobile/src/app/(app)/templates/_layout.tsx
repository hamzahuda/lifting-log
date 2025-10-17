import { Stack } from "expo-router";
import { HeaderTitle } from "@/components/header-title";
import useSharedHeaderOptions from "@/hooks/useSharedHeaderOptions";

export default function TemplatesLayout() {
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
            <Stack.Screen
                name="index"
                options={{ title: "Workout Templates" }}
            />
            <Stack.Screen
                name="create"
                options={{ title: "Create Template" }}
            />
            <Stack.Screen name="[id]" options={{ title: "Edit Template" }} />
        </Stack>
    );
}
