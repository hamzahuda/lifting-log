import { Tabs } from "expo-router";

export default function AppLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="workouts"
                options={{
                    title: "Home",
                }}
            />
            <Tabs.Screen
                name="templates"
                options={{
                    title: "Templates",
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: "Account",
                }}
            />
        </Tabs>
    );
}
