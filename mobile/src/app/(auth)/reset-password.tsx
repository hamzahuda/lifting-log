import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPasswordScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6"
                keyboardDismissMode="interactive"
            >
                <View className="w-full max-w-sm">
                    <ResetPasswordForm />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
