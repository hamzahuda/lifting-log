import { Stack } from "expo-router";
import useSharedHeaderOptions from "@/hooks/useSharedHeaderOptions";

export default function AccountLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitle: "Account",
                ...useSharedHeaderOptions(),
            }}
        >
            <Stack.Screen name="index" options={{ headerTitle: "Account" }} />
        </Stack>
    );
}
