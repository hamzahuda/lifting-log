import {
    View,
    Alert,
    TextInput,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
    createExerciseGoal,
    updateExerciseGoal,
    fetchExerciseGoal,
    fetchSingleExerciseHistory,
} from "@/services/api";
import { useState, useLayoutEffect, useCallback, useMemo } from "react";
import { LineChart } from "react-native-gifted-charts";
import { Exercise, ExerciseGoal, TimeRange } from "@/types";
import { calculateOneRepMax } from "@/utils/one-rep-max";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import { useFocusEffect } from "@react-navigation/native";
import TimeFilterButton from "./_components/TimeFilterButton";

export default function ProgressDetailScreen() {
    const { exercise_name } = useLocalSearchParams<{ exercise_name: string }>();
    const [exerciseHistory, setExerciseHistory] = useState<Exercise[]>([]);
    const [exerciseGoal, setExerciseGoal] = useState<Partial<ExerciseGoal>>({});
    const [originalGoalWeight, setOriginalGoalWeight] = useState<
        number | undefined
    >(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [selectedRange, setSelectedRange] = useState<TimeRange>("1M");

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

    useFocusEffect(
        useCallback(() => {
            getSingleExerciseHistory();
            getExerciseGoal();
        }, [exercise_name]),
    );

    const chartData = useMemo(() => {
        if (!exerciseHistory || exerciseHistory.length === 0) return [];

        const dataMap = new Map<string, number>();

        exerciseHistory.forEach((exercise) => {
            // Calculate 1RM for this specific workout
            let highestOneRepMax = 0;
            exercise.sets.forEach((set) => {
                const oneRepMax = calculateOneRepMax(
                    Number(set.weight),
                    Number(set.reps),
                );
                if (oneRepMax > highestOneRepMax) {
                    highestOneRepMax = oneRepMax;
                }
            });

            const dateKey = new Date(exercise.date).toISOString().split("T")[0];

            // If multiple workouts in one day, take the higher max
            const existing = dataMap.get(dateKey) || 0;
            if (highestOneRepMax > existing) {
                dataMap.set(dateKey, highestOneRepMax);
            }
        });

        const now = new Date();
        // Reset time to end of day to ensure we include today
        now.setHours(23, 59, 59, 999);

        let startDate = new Date();

        switch (selectedRange) {
            case "1W":
                startDate.setDate(now.getDate() - 7);
                break;
            case "1M":
                startDate.setMonth(now.getMonth() - 1);
                break;
            case "3M":
                startDate.setMonth(now.getMonth() - 3);
                break;
            case "6M":
                startDate.setMonth(now.getMonth() - 6);
                break;
            case "1Y":
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case "All":
                if (exerciseHistory.length > 0) {
                    startDate = new Date(exerciseHistory[0].date);
                }
                break;
        }

        const result = [];
        const currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);

        while (currentDate <= now) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const hasData = dataMap.has(dateStr);
            const value = hasData ? dataMap.get(dateStr) : null;

            let label = "";
            const day = currentDate.getDate();
            const month = currentDate.getMonth();
            const dayOfWeek = currentDate.getDay();

            if (selectedRange === "1W") {
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                label = days[dayOfWeek];
            } else if (selectedRange === "1M") {
                if (day % 5 === 0) label = `${day}`;
            } else {
                if (day === 1) {
                    const months = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    label = months[month];
                }
            }

            result.push({
                value: value ?? undefined,
                label: label,
                hideDataPoint: !hasData,
                dataPointColor: "#ffffff",
                dataPointRadius: 3,
                date: dateStr,
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }, [exerciseHistory, selectedRange]);

    // Dynamically calculate chart spacing to fit screen width
    const chartSpacing = useMemo(() => {
        if (!chartData || chartData.length <= 1) return 50;

        const screenWidth = Dimensions.get("window").width;
        const horizontalPadding = 100;
        const availableWidth = screenWidth - horizontalPadding;
        const intervals = chartData.length - 1;

        return availableWidth / intervals;
    }, [chartData]);

    const hasChanges = exerciseGoal.goal_weight !== originalGoalWeight;
    const canSave = hasChanges && !saving;

    const handleTimeRangeChange = (range: TimeRange) => {
        setSelectedRange(range);
    };

    return (
        <ScreenStateWrapper
            isLoading={loading}
            isNotFound={exerciseHistory?.length === 0}
            notFoundMessage={["No history found for", exercise_name]}
        >
            <View>
                <View className="flex-row justify-center mb-4 mt-2">
                    {(["1W", "1M", "3M", "6M", "1Y", "All"] as TimeRange[]).map(
                        (range) => (
                            <TimeFilterButton
                                key={range}
                                range={range}
                                active={selectedRange === range}
                                onPress={handleTimeRangeChange}
                            />
                        ),
                    )}
                </View>

                {chartData.length > 0 && (
                    <View className="items-center">
                        <LineChart
                            data={chartData}
                            height={250}
                            thickness={2}
                            color="#ffffff"
                            initialSpacing={10}
                            spacing={chartSpacing}
                            hideRules
                            yAxisTextStyle={{ color: "#ffffff", fontSize: 10 }}
                            xAxisLabelTextStyle={{
                                color: "#ffffff",
                                fontSize: 10,
                                width: 40,
                            }}
                            yAxisColor="#ffffff"
                            xAxisColor="#ffffff"
                            extrapolateMissingValues={false}
                        />
                    </View>
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
