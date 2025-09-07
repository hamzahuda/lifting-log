import { View } from "react-native";
import LoginRegisterForm from "../../components/LoginRegisterForm";

export default function Login() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <LoginRegisterForm route="/token/" method="login" />
        </View>
    );
}
