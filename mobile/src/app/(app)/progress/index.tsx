import { useState, useCallback } from "react";
import { ScrollView, View } from "react-native";
import { fetchPerformedExercises } from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import ProgressListItem from "./_components/ProgressListItem";
import { useRouter } from "expo-router";

export default function ProgressListScreen() {
    const [exercise_names, setExercises] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    const getWorkouts = useCallback(async () => {
        try {
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
                isEmpty={exercise_names.length === 0}
                emptyMessage={[
                    "No exercise_names found,",
                    "Complete your first workout to get started.",
                ]}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 210 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        {exercise_names.map((exercise_name, index) => (
                            <ProgressListItem
                                key={index}
                                exercise_name={exercise_name}
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
