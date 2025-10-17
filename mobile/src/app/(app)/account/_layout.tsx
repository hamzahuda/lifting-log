import { Stack } from "expo-router";
import { HeaderTitle } from "@/components/header-title";
import useSharedHeaderOptions from "@/hooks/useSharedHeaderOptions";

export default function AccountLayout() {
    const sharedHeaderOptions = useSharedHeaderOptions();
    return (
        <Stack
            screenOptions={{
                headerTitle: (props) => {
                    return <HeaderTitle title={props.children} />;
                },
                ...sharedHeaderOptions,
            }}
        >
            <Stack.Screen name="index" options={{ headerTitle: "Account" }} />
        </Stack>
    );
}
