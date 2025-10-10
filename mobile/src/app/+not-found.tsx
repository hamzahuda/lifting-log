import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";

export default function NotFound() {
    const router = useRouter();
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>Page Not Found</Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
                <Text className="underline">Go Home</Text>
            </TouchableOpacity>
        </View>
    );
}
