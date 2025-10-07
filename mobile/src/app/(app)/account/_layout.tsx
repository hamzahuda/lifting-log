import { Stack } from "expo-router";
const colors = require("@/styles/colors");

export default function AccountLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.header,
                },
                headerTitle: "Account",
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 26,
                },
            }}
        >
            <Stack.Screen name="index" options={{ headerTitle: "Account" }} />
        </Stack>
    );
}
