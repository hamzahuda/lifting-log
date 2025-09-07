import { Stack } from "expo-router";

const isAuthenticated = true;

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="(auth)" />
            </Stack.Protected>

            <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="(app)" />
            </Stack.Protected>
        </Stack>
    );
}
