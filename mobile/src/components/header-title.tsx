import { View, Text } from "react-native";

export function HeaderTitle({ title }: { title: string }) {
    return (
        <View className=" bg-red-500">
            <Text className="text-foreground text-center text-2xl">
                {title}
            </Text>
        </View>
    );
}
