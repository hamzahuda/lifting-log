import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ animation: "none" }} />
            <Stack.Screen name="sign-up" options={{ animation: "none" }} />
            <Stack.Screen
                name="forgot-password"
                options={{ animation: "slide_from_bottom" }}
            />
        </Stack>
    );
}
