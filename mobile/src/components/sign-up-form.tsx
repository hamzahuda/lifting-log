import { SocialConnections } from "@/components/social-connections";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { supabase } from "@/services/supabase";
import { useRef, useState } from "react";
import { TouchableOpacity, TextInput, View, Alert } from "react-native";
import { useRouter } from "expo-router";

export function SignUpForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    function onEmailSubmitEditing() {
        passwordInputRef.current?.focus();
    }
    function onPasswordSubmitEditing() {
        confirmPasswordInputRef.current?.focus();
    }

    async function onSubmit() {
        if (!email || !password || !confirmPassword) {
            Alert.alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match.");
            return;
        }

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
    }

    return (
        <View className="gap-6">
            <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
                <CardHeader>
                    <CardTitle className="text-center text-xl sm:text-left">
                        Create your account
                    </CardTitle>
                    <CardDescription className="text-center sm:text-left">
                        Welcome! Please fill in the details to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent className="gap-6">
                    <View className="gap-6">
                        <View className="gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="john@example.com"
                                keyboardType="email-address"
                                autoComplete="email"
                                autoCapitalize="none"
                                onSubmitEditing={onEmailSubmitEditing}
                                returnKeyType="next"
                                submitBehavior="submit"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                        <View className="gap-1.5">
                            <View className="flex-row items-center">
                                <Label htmlFor="password">Password</Label>
                            </View>
                            <Input
                                ref={passwordInputRef}
                                id="password"
                                secureTextEntry
                                placeholder="********"
                                returnKeyType="next"
                                onSubmitEditing={onPasswordSubmitEditing}
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                        <View className="gap-1.5">
                            <View className="flex-row items-center">
                                <Label htmlFor="confirm-password">
                                    Confirm Password
                                </Label>
                            </View>
                            <Input
                                ref={confirmPasswordInputRef}
                                id="confirm-password"
                                secureTextEntry
                                placeholder="********"
                                returnKeyType="send"
                                onSubmitEditing={onSubmit}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                        <Button className="w-full" onPress={onSubmit}>
                            <Text>Sign Up</Text>
                        </Button>
                    </View>
                    <TouchableOpacity
                        className="flex-row justify-center gap-1"
                        onPress={() => router.back()}
                    >
                        <Text className="text-center text-sm">
                            Already have an account?{" "}
                            <Text className="text-sm underline underline-offset-4">
                                Sign in
                            </Text>
                        </Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <Separator className="flex-1" />
                        <Text className="text-muted-foreground px-4 text-sm">
                            or
                        </Text>
                        <Separator className="flex-1" />
                    </View>
                    <SocialConnections />
                </CardContent>
            </Card>
        </View>
    );
}
