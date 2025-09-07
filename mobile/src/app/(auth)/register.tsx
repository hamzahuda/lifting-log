import LoginRegisterForm from "@/src/components/LoginRegisterForm";
import { View } from "react-native";

export default function Register() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <LoginRegisterForm route="/users/" method="register" />
        </View>
    );
}
