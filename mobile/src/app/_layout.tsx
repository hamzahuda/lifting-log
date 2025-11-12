import { Stack, SplashScreen } from "expo-router";
import { SessionProvider, useSession } from "../context/SessionContext";
import { SplashScreenController } from "../splash";
import "../global.css";
import { useState, useEffect } from "react";
import { PortalHost } from "@rn-primitives/portal";
import { AppState } from "react-native";
import { supabase } from "@/services/supabase";
import { useColorScheme } from "nativewind";
import * as SystemUI from "expo-system-ui";
import { THEME, NAV_THEME } from "@/utils/theme";
import { ThemeProvider } from "@react-navigation/native";
import {
    deleteAllCustomExercises,
    initialiseDatabase,
} from "@/services/localDatabase";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

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

SystemUI.setBackgroundColorAsync(THEME["dark"].background);

export default function Root() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const navTheme = colorScheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

    useEffect(() => {
        setColorScheme("dark");
    }, []);

    return (
        <ThemeProvider value={navTheme}>
            <SessionProvider>
                <SQLiteProvider databaseName="liftinglog.db">
                    <SplashScreenController />
                    <RootNavigator />
                    <PortalHost />
                </SQLiteProvider>
            </SessionProvider>
        </ThemeProvider>
    );
}

function RootNavigator() {
    const { session, isLoading } = useSession();
    const [hasWaited, setHasWaited] = useState(false);

    const db = useSQLiteContext();
    const [isDbInitialized, setIsDbInitialized] = useState(false);

    // Initialize the database
    useEffect(() => {
        const setupDatabase = async () => {
            if (session && db && hasWaited && !isDbInitialized) {
                try {
                    await initialiseDatabase(db);
                    setIsDbInitialized(true);
                } catch (e) {
                    console.error("Failed to initialize database:", e);
                }
            }
        };

        setupDatabase();
    }, [session, db, hasWaited, isDbInitialized]);

    useEffect(() => {
        const cleanupDatabase = async () => {
            if (!session && db) {
                await deleteAllCustomExercises(db);
                setIsDbInitialized(false);
            }
        };

        cleanupDatabase();
    }, [session, db]);

    useEffect(() => {
        // If user is logged in AND we haven't waited yet
        if (session && !hasWaited) {
            const timer = setTimeout(() => {
                setHasWaited(true);
            }, 1000);

            return () => clearTimeout(timer);
        }

        // If user is logged out, reset hasWaited
        if (!session) {
            setHasWaited(false);
        }
    }, [session, hasWaited]);

    if (isLoading || (session && (!hasWaited || !isDbInitialized))) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(app)" />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen name="(auth)" />
            </Stack.Protected>
        </Stack>
    );
}
