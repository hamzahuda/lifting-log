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
import { Text } from "@/components/ui/text";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export function ForgotPasswordForm() {
    const router = useRouter();
    function onSubmit() {
        // TODO: Submit form and navigate to reset password screen if successful
    }

    return (
        <View className="gap-6">
            <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
                <CardHeader>
                    <CardTitle className="text-center text-xl sm:text-left">
                        Forgot password?
                    </CardTitle>
                    <CardDescription className="text-center sm:text-left">
                        Enter your email to reset your password
                    </CardDescription>
                </CardHeader>
                <CardContent className="gap-6">
                    <View className="gap-6">
                        <View className="gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="liftinglog@example.com"
                                keyboardType="email-address"
                                autoComplete="email"
                                autoCapitalize="none"
                                returnKeyType="send"
                                onSubmitEditing={onSubmit}
                            />
                        </View>
                        <Button className="w-full" onPress={onSubmit}>
                            <Text>Reset your password</Text>
                        </Button>
                    </View>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className="text-center text-sm text-muted-foreground underline">
                            Back to Sign In
                        </Text>
                    </TouchableOpacity>
                </CardContent>
            </Card>
        </View>
    );
}
