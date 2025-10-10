import { Stack } from "expo-router";
import { THEME } from "@/rn-reusables/theme";
import { useColorScheme } from "nativewind";

export default function AccountLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor:
                        THEME[useColorScheme().colorScheme ?? "dark"]
                            .foreground,
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
