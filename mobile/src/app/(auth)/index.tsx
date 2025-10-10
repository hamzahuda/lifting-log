import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignInForm } from "@/components/sign-in-form";

export default function SignInScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6"
                keyboardDismissMode="interactive"
            >
                <View className="w-full max-w-sm">
                    <SignInForm />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
