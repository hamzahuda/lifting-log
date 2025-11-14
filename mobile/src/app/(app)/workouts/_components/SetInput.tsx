import { TextInput, TextInputProps } from "react-native";

export default function SetInput(props: TextInputProps) {
    return (
        <TextInput
            className="text-lg text-center w-16 py-1 bg-secondary rounded-md text-foreground"
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
            {...props}
        />
    );
}
