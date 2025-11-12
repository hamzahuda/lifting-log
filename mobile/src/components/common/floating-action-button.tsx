import { TouchableOpacity, Text } from "react-native";

type FloatingActionButtonProps = {
    onPress: () => void;
};

export default function FloatingActionButton({
    onPress,
}: FloatingActionButtonProps) {
    return (
        <TouchableOpacity
            className="absolute bottom-28 right-4 w-16 h-16 bg-accent rounded-2xl justify-center items-center shadow-lg shadow-black"
            onPress={onPress}
        >
            <Text className="text-white text-3xl">+</Text>
        </TouchableOpacity>
    );
}
