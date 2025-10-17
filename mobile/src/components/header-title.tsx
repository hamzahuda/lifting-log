import { View, Text } from "react-native";

export function HeaderTitle({ title }: { title: string }) {
    return (
        <View>
            <Text className="text-foreground text-2xl">{title}</Text>
        </View>
    );
}
