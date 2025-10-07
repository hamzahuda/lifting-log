import { useState } from "react";
import { Alert, AppState, TouchableOpacity, Text, View } from "react-native";
import { supabase } from "@/utils/supabase";
import { Input } from "@rneui/base";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from "@react-native-google-signin/google-signin";

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

export default function Auth() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert(error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert(error.message);
        } else if (!session) {
            Alert.alert("Please check your inbox for email verification!");
        }
        setLoading(false);
    }

    GoogleSignin.configure({
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        webClientId:
            "47471637371-kmifq5fhlujqjpsdvosmd3dcra7rig6e.apps.googleusercontent.com",
    });

    return (
        <SafeAreaView className="mx-5 my-10 flex-col items-center">
            <Input
                label="Email"
                leftIcon={{ type: "font-awesome", name: "envelope" }}
                onChangeText={(text: string) => setEmail(text)}
                value={email}
                placeholder="email@address.com"
                autoCapitalize={"none"}
            />
            <Input
                label="Password"
                leftIcon={{ type: "font-awesome", name: "lock" }}
                onChangeText={(text: string) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="Password"
                autoCapitalize={"none"}
            />
            <TouchableOpacity
                className="bg-accent rounded-md h-12 w-80 items-center justify-center"
                disabled={loading}
                onPress={() => signInWithEmail()}
            >
                <Text className="text-white text-lg">Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-accent rounded-md h-12 w-80 items-center justify-center mt-5"
                disabled={loading}
                onPress={() => signUpWithEmail()}
            >
                <Text className="text-white text-lg">Sign Up</Text>
            </TouchableOpacity>
            <View className="mt-5">
                <GoogleSigninButton
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Dark}
                    onPress={async () => {
                        try {
                            await GoogleSignin.hasPlayServices();
                            const userInfo = await GoogleSignin.signIn();
                            if (userInfo.data?.idToken) {
                                const { data, error } =
                                    await supabase.auth.signInWithIdToken({
                                        provider: "google",
                                        token: userInfo.data.idToken,
                                    });
                                console.log(error, data);
                            } else {
                                throw new Error("no ID token present!");
                            }
                        } catch (error: any) {
                            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                                // user cancelled the login flow
                            } else if (error.code === statusCodes.IN_PROGRESS) {
                                // operation (e.g. sign in) is in progress already
                            } else if (
                                error.code ===
                                statusCodes.PLAY_SERVICES_NOT_AVAILABLE
                            ) {
                                // play services not available or outdated
                            } else {
                                // some other error happened
                            }
                        }
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
