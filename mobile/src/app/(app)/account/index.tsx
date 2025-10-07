import { supabase } from "@/utils/supabase";
import { View, Text } from "react-native";
import { Button } from "@rneui/base";
import { useSession } from "@/context/ctx";
import {} from "react-native-safe-area-context";

export default function Account() {
    const { session } = useSession();

    return (
        <View className="flex-1 bg-background p-5">
            <View className="flex-1 justify-center">
                <Text className="text-t-primary text-lg mb-2">Email</Text>
                <View className="bg-secondary p-4 rounded-lg mb-8">
                    <Text className="text-t-primary text-lg">
                        {session?.user?.email}
                    </Text>
                </View>
                <Button
                    title="Sign Out"
                    buttonStyle={{
                        backgroundColor: "#3B82F6",
                        paddingVertical: 15,
                        borderRadius: 10,
                    }}
                    titleStyle={{ fontWeight: "bold", fontSize: 18 }}
                    onPress={() => supabase.auth.signOut()}
                />
            </View>
        </View>
    );
}
