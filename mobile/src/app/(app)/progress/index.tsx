import { useState, useCallback } from "react";
import { ScrollView, View, Text } from "react-native";
import { fetchPerformedExercises } from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";

export default function ProgressListScreen() {
    const [exercises, setExercises] = useState<String[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const getWorkouts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchPerformedExercises();
            setExercises(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getWorkouts();
        }, [getWorkouts]),
    );

    return (
        <View className="flex-1 bg-background p-2">
            <ScreenStateWrapper
                isLoading={loading}
                isEmpty={exercises.length === 0}
                emptyMessage={[
                    "No exercises found,",
                    "Complete your first workout to get started.",
                ]}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 210 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        {exercises.map((exercise, index) => (
                            <View key={index}>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-foreground">
                                        {exercise}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ScreenStateWrapper>
        </View>
    );
}
