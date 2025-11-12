import { Tabs } from "expo-router";
import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function AppLayout() {
    const themeColors = useThemeColors();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: themeColors.foreground,
                tabBarInactiveTintColor: themeColors.mutedForeground,
                tabBarStyle: {
                    height: 94,
                    paddingTop: 14,
                    borderTopWidth: 0,
                    backgroundColor: "transparent",
                    position: "absolute",
                    elevation: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
                tabBarBackground() {
                    return (
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: themeColors.background,
                                borderWidth: 2,
                                borderColor: themeColors.border,
                                borderBottomColor: "transparent",
                                borderLeftColor: "transparent",
                                borderRightColor: "transparent",
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
