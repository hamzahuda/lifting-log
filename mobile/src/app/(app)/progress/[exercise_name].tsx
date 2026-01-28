import { View, Alert } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fetchSingleExerciseHistory } from "@/services/api";
import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { LineChart } from "react-native-gifted-charts";
import { Exercise } from "@/types";
import { calculateOneRepMax } from "@/utils/one-rep-max";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import { useFocusEffect } from "@react-navigation/native";
import { set } from "lodash";

export default function ProgressDetailScreen() {
    const { exercise_name } = useLocalSearchParams<{ exercise_name: string }>();
    const [exerciseHistory, setExerciseHistory] = useState<Exercise[]>();
    const [loading, setLoading] = useState<boolean>(true);
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
        }, [exercise_name]),
    );

    useEffect(() => {
        getSingleExerciseHistory();
    }, [exercise_name]);

    return (
        <ScreenStateWrapper
            isLoading={loading}
            isNotFound={exerciseHistory?.length === 0}
            notFoundMessage={["No history found for", exercise_name]}
        >
            <View>
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
            </View>
        </ScreenStateWrapper>
    );
}
