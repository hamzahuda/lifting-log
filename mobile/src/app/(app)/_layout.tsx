import { Tabs } from "expo-router";
import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { THEME } from "@/utils/theme";
import { View } from "react-native";

export default function AppLayout() {
    const { colorScheme } = useColorScheme();
    const themeColors =
        colorScheme === undefined ? THEME.dark : THEME[colorScheme];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: themeColors.foreground,
                tabBarInactiveTintColor: themeColors.mutedForeground,
                tabBarStyle: {
                    height: 100,
                    paddingTop: 14,
                    borderTopWidth: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
                tabBarBackground() {
                    return (
                        <View
                            style={{
                                flex: 1,
                                borderRadius: 50,
                                backgroundColor: themeColors.background,
                                borderWidth: 1,
                                borderColor: themeColors.border,
                                borderBottomColor: "transparent",
                            }}
                        />
                    );
                },
            }}
        >
            <Tabs.Screen
                name="templates"
                options={{
                    title: "Templates",
                    tabBarIcon: ({ color }) => (
                        <Ionicons
                            name="document-text"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    title: "Workouts",
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="weight-lifter"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="user" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
