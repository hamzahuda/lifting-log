import { Stack } from "expo-router";
import { HeaderTitle } from "@/components/header-title";

export default function AccountLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitle: (props) => {
                    return <HeaderTitle title={props.children} />;
                },
            }}
        >
            <Stack.Screen name="index" options={{ headerTitle: "Account" }} />
        </Stack>
    );
}
