import { Stack, SplashScreen } from "expo-router";
import { SessionProvider, useSession } from "../context/ctx";
import { SplashScreenController } from "../splash";
import "../styles/global.css";
SplashScreen.preventAutoHideAsync();

export default function Root() {
    return (
        <SessionProvider>
            <SplashScreenController />
            <RootNavigator />
        </SessionProvider>
    );
}

function RootNavigator() {
    const { session, isLoading } = useSession();

    if (isLoading) {
        return null;
    }

    return (
        <Stack>
            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen name="auth" options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>
    );
}
