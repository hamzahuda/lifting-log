import { Tabs } from "expo-router";

export default function AuthLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="login" />
            <Tabs.Screen name="register" />
        </Tabs>
    );
}
