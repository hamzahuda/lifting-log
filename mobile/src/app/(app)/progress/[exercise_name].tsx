import {
    View,
    Alert,
    TextInput,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
    createExerciseGoal,
    updateExerciseGoal,
    fetchExerciseGoal,
    fetchSingleExerciseHistory,
} from "@/services/api";
import { useState, useLayoutEffect, useCallback } from "react";
import { LineChart } from "react-native-gifted-charts";
import { Exercise, ExerciseGoal } from "@/types";
import { calculateOneRepMax } from "@/utils/one-rep-max";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import { useFocusEffect } from "@react-navigation/native";

export default function ProgressDetailScreen() {
    const { exercise_name } = useLocalSearchParams<{ exercise_name: string }>();
    const [exerciseHistory, setExerciseHistory] = useState<Exercise[]>();
    const [exerciseGoal, setExerciseGoal] = useState<Partial<ExerciseGoal>>({});
    const [originalGoalWeight, setOriginalGoalWeight] = useState<
        number | undefined
    >(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ title: exercise_name });
    }, [navigation]);

    const getSingleExerciseHistory = async () => {
        try {
            setLoading(true);
            const res = await fetchSingleExerciseHistory(exercise_name);
            setExerciseHistory(res.data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch this exercise's history.");
        } finally {
            setLoading(false);
        }
    };

    const getExerciseGoal = async () => {
        try {
            const res = await fetchExerciseGoal(exercise_name);
            if (res.data.length > 0) {
                setExerciseGoal(res.data[0]);
                setOriginalGoalWeight(res.data[0].goal_weight);
            } else {
                setOriginalGoalWeight(undefined);
            }
        } catch (error) {
            console.error("Failed to fetch goal", error);
        }
    };

    const handleLocalUpdate = (text: string) => {
        if (/^\d*$/.test(text)) {
            setExerciseGoal((prev) => ({
                ...prev,
                goal_weight: text === "" ? 0 : Number(text),
            }));
        }
    };

    const handleSave = async () => {
        if (exerciseGoal.goal_weight === undefined) return;

        try {
            setSaving(true);
            if (exerciseGoal.id) {
                await updateExerciseGoal(
                    exerciseGoal.id,
                    exerciseGoal.goal_weight,
                );
            } else {
                await createExerciseGoal(
                    exercise_name,
                    exerciseGoal.goal_weight,
                );
                await getExerciseGoal();
            }

            setOriginalGoalWeight(exerciseGoal.goal_weight);
            Alert.alert("Success", "Goal saved successfully.");
        } catch (error) {
            Alert.alert("Error", "Failed to save goal.");
        } finally {
            setSaving(false);
        }
    };

    const calculateValuesFromHistory = () => {
        const values = exerciseHistory?.map((exercise) => {
            let highestOneRepMax = 0;
            for (const set of exercise.sets) {
                const oneRepMax = calculateOneRepMax(
                    Number(set.weight),
                    Number(set.reps),
                );
                if (oneRepMax > highestOneRepMax) {
                    highestOneRepMax = oneRepMax;
                }
            }
            return { value: highestOneRepMax };
        });
        return values;
    };

    useFocusEffect(
        useCallback(() => {
            getSingleExerciseHistory();
            getExerciseGoal();
        }, [exercise_name]),
    );

    const hasChanges = exerciseGoal.goal_weight !== originalGoalWeight;
    const canSave = hasChanges && !saving;

    return (
        <ScreenStateWrapper
            isLoading={loading}
            isNotFound={exerciseHistory?.length === 0}
            notFoundMessage={["No history found for", exercise_name]}
        >
            <View>
                {exerciseHistory && exerciseHistory.length > 0 && (
                    <LineChart
                        initialSpacing={0}
                        data={calculateValuesFromHistory()}
                        spacing={50}
                        dataPointsColor1="#ffffff"
                        thickness={2}
                        hideRules
                        isAnimated
                        yAxisTextStyle={{ color: "#ffffff" }}
                        xAxisLabelTextStyle={{ color: "#ffffff" }}
                        yAxisColor="#ffffff"
                        xAxisColor="#ffffff"
                        color="#ffffff"
                    />
                )}

                <View className="flex-row items-center justify-center mt-6">
                    <Text className="text-foreground">Goal (1RM):</Text>

                    <TextInput
                        className="text-xl text-foreground font-bold mx-2 bg-secondary rounded-md px-3 py-1 min-w-[60px] text-center"
                        onChangeText={handleLocalUpdate}
                        value={
                            exerciseGoal.goal_weight
                                ? exerciseGoal.goal_weight.toString()
                                : ""
                        }
                        placeholder="0"
                        placeholderTextColor="gray"
                        keyboardType="numeric"
                        returnKeyType="done"
                    />

                    <Text className="text-foreground mr-4">kg</Text>

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!canSave}
                        className={`px-4 py-2 rounded-lg flex-row items-center ${
                            canSave ? "bg-primary" : "bg-muted opacity-50"
                        }`}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text
                                className={`${canSave ? "text-primary-foreground" : "text-muted-foreground"} font-bold`}
                            >
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenStateWrapper>
    );
}
