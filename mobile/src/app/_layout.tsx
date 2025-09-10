import { Stack } from "expo-router";
import { SessionProvider } from "../context/ctx";

const isAuthenticated = true;

export default function RootLayout() {
    return (
        <SessionProvider>
            <Stack>
                <Stack.Protected guard={!isAuthenticated}>
                    <Stack.Screen name="(auth)" />
                </Stack.Protected>

                <Stack.Protected guard={isAuthenticated}>
                    <Stack.Screen name="(app)" />
                </Stack.Protected>
            </Stack>
        </SessionProvider>
    );
}
