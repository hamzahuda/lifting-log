import { Stack } from "expo-router";
import { Header } from "@/components/header";

export default function AccountLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitle: (props) => {
                    return <Header title={props.children} />;
                },
            }}
        >
            <Stack.Screen name="index" options={{ headerTitle: "Account" }} />
        </Stack>
    );
}
