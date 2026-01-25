import { useState, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { fetchPerformedExercises } from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import ProgressListItem from "./_components/ProgressListItem";
import { useRouter } from "expo-router";

export default function ProgressListScreen() {
    const [exercises, setExercises] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

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
                            <ProgressListItem
                                key={index}
                                exercise={exercise}
                                onPress={(exercise) =>
                                    router.push(`/progress/${exercise}`)
                                }
                            />
                        ))}
                    </View>
                </ScrollView>
            </ScreenStateWrapper>
        </View>
    );
}
