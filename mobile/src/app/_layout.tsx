import { Stack, SplashScreen } from "expo-router";
import { SessionProvider, useSession } from "../context/ctx";
import { SplashScreenController } from "../splash";
import "../global.css";
import { useState, useEffect } from "react";
import { PortalHost } from "@rn-primitives/portal";
import { AppState } from "react-native";
import { supabase } from "@/services/supabase";
import { useColorScheme } from "nativewind";
SplashScreen.preventAutoHideAsync();

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
    if (state === "active") {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default function Root() {
    const { setColorScheme } = useColorScheme();
    useEffect(() => {
        setColorScheme("dark");
    }, []);

    return (
        <SessionProvider>
            <SplashScreenController />
            <RootNavigator />
            <PortalHost />
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
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>
    );
}
