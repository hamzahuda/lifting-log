import { Stack, SplashScreen } from "expo-router";
import { SessionProvider, useSession } from "../context/ctx";
import { SplashScreenController } from "../splash";
import "../styles/global.css";
import { useState, useEffect } from "react";
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
    const [hasWaited, setHasWaited] = useState(false);

    useEffect(() => {
        // If user is logged in AND we haven't waited yet
        if (session && !hasWaited) {
            const timer = setTimeout(() => {
                setHasWaited(true);
            }, 500);

            return () => clearTimeout(timer);
        }

        // If user is logged out, reset hasWaited
        if (!session) {
            setHasWaited(false);
        }
    }, [session, hasWaited]);

    // Show a blank screen while loading or if we are waiting for token persistence after login
    if (isLoading || (session && !hasWaited)) {
        return null;
    }

    return (
        <Stack>
            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen
                    name="(auth)/index"
                    options={{ headerShown: false }}
                />
            </Stack.Protected>
        </Stack>
    );
}
