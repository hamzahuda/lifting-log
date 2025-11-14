import { ActivityIndicator, Text, View } from "react-native";

type ScreenStateWrapperProps = {
    isLoading: boolean;
    children: React.ReactNode;

    // For list screens
    isEmpty?: boolean;
    emptyMessage?: string[];
    // For detail screens
    isNotFound?: boolean;
    notFoundMessage?: string[];
};

const MessageDisplay = ({ message }: { message: string[] }) => {
    return (
        <View className="flex-1 justify-center items-center mb-60">
            {message.map((text, index) => (
                <Text key={index} className="text-muted-foreground text-center">
                    {text}
                </Text>
            ))}
        </View>
    );
};

export default function ScreenStateWrapper({
    isLoading,
    isEmpty,
    emptyMessage = ["No results."],
    isNotFound,
    notFoundMessage = ["Not found."],
    children,
}: ScreenStateWrapperProps) {
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center mb-60">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (isNotFound) {
        return <MessageDisplay message={notFoundMessage} />;
    }

    if (isEmpty) {
        return <MessageDisplay message={emptyMessage} />;
    }

    return <>{children}</>;
}
