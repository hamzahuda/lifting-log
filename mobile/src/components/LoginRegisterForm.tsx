import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import api from "../utils/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../utils/constants";

function LoginRegisterForm({
    route,
    method,
}: {
    route: string;
    method: "login" | "register";
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async () => {
        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                await SecureStore.setItemAsync(ACCESS_TOKEN, res.data.access);
                await SecureStore.setItemAsync(REFRESH_TOKEN, res.data.refresh);
                router.navigate("/");
            } else {
                router.navigate("/login");
            }
        } catch (error) {
            alert(error);
        }
    };

    return (
        <View>
            <Text>{name}</Text>
            <TextInput
                className="form-input"
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
            />
            <TextInput
                className="form-input"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
            />
            <Button title={name} onPress={handleSubmit} />
        </View>
    );
}

export default LoginRegisterForm;
