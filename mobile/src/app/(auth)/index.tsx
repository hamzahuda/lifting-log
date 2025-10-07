import { useState } from "react";
import { Alert, AppState, TouchableOpacity, Text } from "react-native";
import { supabase } from "@/utils/supabase";
import { Input } from "@rneui/base";
import { SafeAreaView } from "react-native-safe-area-context";

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

    return (
        <SafeAreaView className="mx-5 my-10">
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
                className="bg-accent rounded-md h-12 items-center justify-center"
                disabled={loading}
                onPress={() => signInWithEmail()}
            >
                <Text className="text-t-primary text-lg">Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-accent rounded-md h-12 items-center justify-center mt-5"
                disabled={loading}
                onPress={() => signUpWithEmail()}
            >
                <Text className="text-t-primary text-lg">Sign Up</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
