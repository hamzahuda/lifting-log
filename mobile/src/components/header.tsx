import { View, Text } from "react-native";

export function Header({ title }: { title: string }) {
    return (
        <View className="flex-1">
            <Text className="text-foreground text-center text-2xl">
                {title}
            </Text>
        </View>
    );
}
