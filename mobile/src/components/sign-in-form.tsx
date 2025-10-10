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
import * as React from "react";
import { Pressable, type TextInput, View, Alert } from "react-native";
import { supabase } from "@/services/supabase";

export function SignInForm() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const passwordInputRef = React.useRef<TextInput>(null);
    function onEmailSubmitEditing() {
        passwordInputRef.current?.focus();
    }

    async function onSubmit() {
        if (!email || !password) {
            Alert.alert("Please enter email and password.");
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            Alert.alert(error.message);
        }
    }

    return (
        <View className="gap-6">
            <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
                <CardHeader>
                    <CardTitle className="text-center text-xl sm:text-left">
                        Sign in to your app
                    </CardTitle>
                    <CardDescription className="text-center sm:text-left">
                        Welcome back! Please sign in to continue
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
                                value={email}
                                onChangeText={setEmail}
                                textContentType="emailAddress"
                                onSubmitEditing={onEmailSubmitEditing}
                                returnKeyType="next"
                                submitBehavior="submit"
                            />
                        </View>
                        <View className="gap-1.5">
                            <View className="flex-row items-center">
                                <Label htmlFor="password">Password</Label>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                                    onPress={() => {
                                        // TODO: Navigate to forgot password screen
                                    }}
                                >
                                    <Text className="font-normal leading-4">
                                        Forgot your password?
                                    </Text>
                                </Button>
                            </View>
                            <Input
                                ref={passwordInputRef}
                                id="password"
                                secureTextEntry
                                placeholder="********"
                                value={password}
                                onChangeText={setPassword}
                                textContentType="password"
                                returnKeyType="send"
                                onSubmitEditing={onSubmit}
                            />
                        </View>
                        <Button className="w-full" onPress={onSubmit}>
                            <Text>Continue</Text>
                        </Button>
                    </View>
                    <Text className="text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Pressable
                            onPress={() => {
                                // TODO: Navigate to sign up screen
                            }}
                        >
                            <Text className="text-sm underline underline-offset-4">
                                Sign up
                            </Text>
                        </Pressable>
                    </Text>
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
