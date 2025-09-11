import { supabase } from "../../utils/supabase";
import { StyleSheet, View, Alert } from "react-native";
import { Button, Input } from "@rneui/base";
import { useSession } from "../../context/ctx";

export default function Account() {
    const { session } = useSession();

    return (
        <View style={styles.container}>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Input label="Email" value={session?.user?.email} disabled />
            </View>
            <View style={styles.verticallySpaced}>
                <Button
                    title="Sign Out"
                    onPress={() => supabase.auth.signOut()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: "stretch",
    },
    mt20: {
        marginTop: 20,
    },
});
