import { Stack } from "expo-router";
import { useSharedHeaderOptions } from "../_utils/useSharedHeaderOptions";

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
