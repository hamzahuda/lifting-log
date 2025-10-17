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
