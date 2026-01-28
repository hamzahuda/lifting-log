import { View, Alert } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { fetchSingleExerciseHistory } from "@/services/api";
import { useState, useEffect, useLayoutEffect } from "react";
import { LineChart } from "react-native-gifted-charts";
import { Exercise } from "@/types";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";

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
            let highestWeight = 0;
            for (let i = 0; i < exercise.sets.length; i++) {
                const set = exercise.sets[i];
                if (set && Number(set.weight) > highestWeight) {
                    highestWeight = Number(set.weight);
                }
            }
            return { value: highestWeight };
        });
        return values;
    };

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
