import { Stack } from "expo-router";
import { SessionProvider, useSession } from "../context/ctx";
import { SplashScreenController } from "../splash";

export default function Root() {
    return (
        <SessionProvider>
            <SplashScreenController />
            <RootNavigator />
        </SessionProvider>
    );
}

function RootNavigator() {
    const { session } = useSession();

    return (
        <Stack>
            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(app)" />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen name="auth" />
            </Stack.Protected>
        </Stack>
    );
}
