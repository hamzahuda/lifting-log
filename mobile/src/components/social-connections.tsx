import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { useColorScheme } from "nativewind";
import { Alert, Image, Platform, View, ActivityIndicator } from "react-native";
import {
    GoogleSignin,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/services/supabase";
import { useState } from "react";

const SOCIAL_CONNECTION_STRATEGIES = [
    {
        type: "oauth_apple",
        source: { uri: "https://img.clerk.com/static/apple.png?width=160" },
        useTint: true,
    },
    {
        type: "oauth_google",
        source: { uri: "https://img.clerk.com/static/google.png?width=160" },
        useTint: false,
    },
];

export function SocialConnections() {
    const { colorScheme } = useColorScheme();
    const [loading, setLoading] = useState(false);

    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
    });
    async function loginWithGoogle() {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            if (userInfo.data?.idToken) {
                await supabase.auth.signInWithIdToken({
                    provider: "google",
                    token: userInfo.data.idToken,
                });
            } else {
                throw new Error("no ID token present!");
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.error("sign in cancelled");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.error(error);
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.error("play services not available: " + error);
            } else {
                console.error(error);
            }
        }
        setLoading(false);
    }

    return loading ? (
        <ActivityIndicator className="text-foreground" size="large" />
    ) : (
        <View className="gap-2 sm:flex-row sm:gap-3">
            {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => {
                return (
                    <Button
                        key={strategy.type}
                        variant="outline"
                        size="sm"
                        className="sm:flex-1"
                        onPress={() => {
                            if (strategy.type === "oauth_google") {
                                loginWithGoogle();
                            } else {
                                Alert.alert("Not implemented yet.");
                            }
                        }}
                    >
                        <Image
                            className={cn(
                                "size-4",
                                strategy.useTint &&
                                    Platform.select({ web: "dark:invert" })
                            )}
                            tintColor={Platform.select({
                                native: strategy.useTint
                                    ? colorScheme === "dark"
                                        ? "white"
                                        : "black"
                                    : undefined,
                            })}
                            source={strategy.source}
                        />
                    </Button>
                );
            })}
        </View>
    );
}
