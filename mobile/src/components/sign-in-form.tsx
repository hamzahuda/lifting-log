import { SocialConnections } from "@/components/social-connections";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { View } from "react-native";

export function SignInForm() {
    return (
        <View className="gap-6">
            <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
                <CardHeader>
                    <Skeleton className="self-center mb-6 h-[100px] w-[100px] rounded-full" />
                    <CardTitle className="text-center text-xl sm:text-left">
                        Sign in to Lifting Log
                    </CardTitle>
                    <CardDescription className="text-center sm:text-left">
                        Welcome back! Please sign in to continue
                    </CardDescription>
                </CardHeader>
                <CardContent className="gap-6">
                    <SocialConnections />
                </CardContent>
            </Card>
        </View>
    );
}
