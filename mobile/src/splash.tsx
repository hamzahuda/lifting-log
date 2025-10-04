import { SplashScreen } from "expo-router";
import { useSession } from "./context/ctx";
import { useEffect } from "react";

export function SplashScreenController() {
    const { isLoading } = useSession();

    useEffect(() => {
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [isLoading]);

    return null;
}
