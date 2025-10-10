import { supabase } from "@/services/supabase";
import api from "@/services/api";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useSession } from "@/context/ctx";

export default function AccountScreen() {
    const { session } = useSession();

    const deleteAccount = async () => {
        await api
            .delete(`/users/${session?.user?.id}/`)
            .then((response) => {
                Alert.alert("Account deleted");
                supabase.auth.signOut();
                console.log(response.data);
            })
            .catch((error) => {
                Alert.alert("Error", "Failed to delete account.");
                console.error(error);
            });
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
                    onPress: () => deleteAccount(),
                    style: "destructive",
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View className="flex-1 flex-col justify-start bg-background p-5">
            <Text className="text-t-primary text-lg mb-2">Email</Text>
            <View className="bg-secondary p-4 rounded-lg mb-8">
                <Text className="text-t-primary text-lg">
                    {session?.user?.email}
                </Text>
            </View>

            <TouchableOpacity
                className="bg-accent p-4 rounded-lg"
                onPress={() => supabase.auth.signOut()}
            >
                <Text className="text-white text-center text-lg font-bold">
                    Sign Out
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-auto bg-danger p-4 mb-10 rounded-lg"
                onPress={confirmAccountDeletion}
            >
                <Text className="text-white text-center text-lg font-bold">
                    Delete Account
                </Text>
            </TouchableOpacity>
        </View>
    );
}
