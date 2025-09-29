import { Tabs } from "expo-router";

export default function AppLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="workouts"
                options={{
                    title: "Home",
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="templates"
                options={{
                    title: "Templates",
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
