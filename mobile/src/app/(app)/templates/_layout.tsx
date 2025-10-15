import { Stack } from "expo-router";
import { Header } from "@/components/header";
export default function TemplatesLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitle: (props) => {
                    return <Header title={props.children} />;
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
