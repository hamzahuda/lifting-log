import { supabase } from "@/services/supabase";
import { deleteUser } from "@/services/api";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useSession } from "@/context/SessionContext";

export default function AccountScreen() {
    const { session } = useSession();

    const handleDeleteAccount = async () => {
        try {
            if (!session?.user?.id) throw new Error("No user ID found.");
            await deleteUser(session.user.id);
            handleSignOut();
        } catch (error) {
            Alert.alert("Error", "Failed to delete account.");
            console.error(error);
        }
    };

    const handleSignOut = () => {
        supabase.auth.signOut();
    };

    const confirmAccountDeletion = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: () => {
                        Alert.alert(
                            "Final Confirmation",
                            "This action is permanent and cannot be undone. Are you absolutely sure?",
                            [
                                {
                                    text: "Cancel",
                                    style: "cancel",
                                },
                                {
                                    text: "Yes, Delete My Account",
                                    onPress: handleDeleteAccount,
                                    style: "destructive",
                                },
                            ]
                        );
                    },
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View className="flex-1 flex-col justify-start bg-background p-5">
            <View className="bg-secondary p-4 rounded-lg mb-8">
                <Text className="text-secondary-foreground text-lg">
                    {session?.user?.email}
                </Text>
            </View>

            <TouchableOpacity
                className="bg-background border border-border p-4 rounded-lg"
                onPress={handleSignOut}
            >
                <Text className="text-foreground text-center text-lg font-bold">
                    Sign Out
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-auto mb-24 bg-red-600 p-4 rounded-lg"
                onPress={confirmAccountDeletion}
            >
                <Text className="text-white text-center text-lg font-bold">
                    Delete Account
                </Text>
            </TouchableOpacity>
        </View>
    );
}
