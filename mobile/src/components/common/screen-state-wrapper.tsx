import { ActivityIndicator, Text, View } from "react-native";

type ScreenStateWrapperProps = {
    isLoading: boolean;
    isEmpty: boolean;
    emptyMessage: string[];
    children: React.ReactNode;
};

export default function ScreenStateWrapper({
    isLoading,
    isEmpty,
    emptyMessage,
    children,
}: ScreenStateWrapperProps) {
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (isEmpty) {
        return (
            <View className="flex-1 flex-col justify-center mb-60">
                {emptyMessage.map((message, index) => (
                    <Text
                        key={index}
                        className="text-muted-foreground text-center"
                    >
                        {message}
                    </Text>
                ))}
            </View>
        );
    }

    return <>{children}</>;
}
