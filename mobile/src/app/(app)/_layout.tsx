import { Tabs } from "expo-router";
import {
    FontAwesome,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { THEME } from "@/utils/theme";

export default function AppLayout() {
    const { colorScheme } = useColorScheme();
    const themeColors =
        colorScheme === undefined ? THEME.dark : THEME[colorScheme];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 90,
                    paddingTop: 14,
                    backgroundColor: themeColors.background,
                },

                tabBarActiveTintColor: themeColors.foreground,
                tabBarInactiveTintColor: themeColors.mutedForeground,

                tabBarLabelStyle: {
                    fontSize: 12,
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
