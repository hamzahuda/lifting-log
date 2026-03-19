import {
    View,
    Alert,
    TextInput,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    FlatList,
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
import { Exercise, ExerciseGoal, TimeRange, RegressionType } from "@/types";
import { calculateOneRepMax } from "@/utils/one-rep-max";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import { useFocusEffect } from "@react-navigation/native";
import TimeFilterButton from "./_components/TimeFilterButton";
import LiftHistoryItem from "./_components/LiftHistoryItem";
import { useRouter } from "expo-router";
import { calculateDaysToGoal, getRegressionResult } from "@/utils/prediction";

type ChartDataPoint = {
    value?: number;
    label: string;
    hideDataPoint: boolean;
    dataPointColor: string;
    dataPointRadius: number;
    date: string;
};

type TrendDataPoint = {
    value?: number;
    hideDataPoint: boolean;
};

export default function ProgressDetailScreen() {
    const { exercise_name } = useLocalSearchParams<{ exercise_name: string }>();
    const [exerciseHistory, setExerciseHistory] = useState<Exercise[]>([]);
    const [exerciseGoal, setExerciseGoal] = useState<Partial<ExerciseGoal>>({});
    const [originalGoalWeight, setOriginalGoalWeight] = useState<
        number | undefined
    >(undefined);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    const [selectedRange, setSelectedRange] = useState<TimeRange>("All");
    const [selectedRegression, setSelectedRegression] =
        useState<RegressionType | null>(null);

    const router = useRouter();
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

    const dailyMaxes = useMemo(() => {
        const map = new Map<string, number>();
        if (!exerciseHistory || exerciseHistory.length === 0) return map;

        exerciseHistory.forEach((exercise) => {
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
            const existing = map.get(dateKey) || 0;
            if (highestOneRepMax > existing) {
                map.set(dateKey, highestOneRepMax);
            }
        });
        return map;
    }, [exerciseHistory]);

    const regressionData = useMemo(() => {
        return exerciseGoal.goal_weight
            ? getRegressionResult(dailyMaxes)
            : null;
    }, [dailyMaxes, exerciseGoal.goal_weight]);

    const activeRegressionType =
        selectedRegression || regressionData?.recommended || "logarithmic";

    const chartData = useMemo(() => {
        const actualData: ChartDataPoint[] = [];
        const trendData: TrendDataPoint[] = [];

        if (dailyMaxes.size === 0) return { actualData, trendData };

        const now = new Date();
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
                if (dailyMaxes.size > 0) {
                    const sortedDates = Array.from(dailyMaxes.keys()).sort();
                    startDate = new Date(sortedDates[0]);
                }
                break;
        }

        const currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);

        while (currentDate <= now) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const hasData = dailyMaxes.has(dateStr);
            const value = hasData ? dailyMaxes.get(dateStr) : null;

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

            actualData.push({
                value: value ?? undefined,
                label: label,
                hideDataPoint: !hasData,
                dataPointColor: "#ffffff",
                dataPointRadius: 3,
                date: dateStr,
            });

            if (regressionData) {
                const model = regressionData.models[activeRegressionType];

                const daysSinceStart =
                    (currentDate.getTime() - regressionData.earliestTimestamp) /
                        (1000 * 60 * 60 * 24) +
                    1;

                let trendValue = undefined;
                if (daysSinceStart >= 1) {
                    trendValue = model.predict(daysSinceStart)[1];
                }

                trendData.push({
                    value: trendValue,
                    hideDataPoint: true,
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return { actualData, trendData };
    }, [dailyMaxes, selectedRange, regressionData, activeRegressionType]);

    const predictionText = useMemo(() => {
        if (dailyMaxes.size === 0 || !regressionData) return null;

        const result = calculateDaysToGoal(
            regressionData,
            dailyMaxes,
            exerciseGoal.goal_weight,
            activeRegressionType,
        );

        if (!result) return null;

        switch (result.status) {
            case "ACHIEVED":
                return "Goal Achieved!";
            case "PLATEAUED":
                return "Progress plateaued - keep pushing to predict!";
            case "OUT_OF_BOUNDS":
                return "Estimated time: > 1 year";
            case "PREDICTED": {
                const { daysRemaining } = result;
                const months = Math.floor(daysRemaining / 30);
                const days = Math.floor(daysRemaining % 30);

                let timeString = "";

                if (months > 0) {
                    timeString += `${months} month${months > 1 ? "s" : ""}`;
                }

                if (days > 0) {
                    if (months > 0) timeString += ", ";
                    timeString += `${days} day${days > 1 ? "s" : ""}`;
                }

                if (timeString === "") {
                    return "Estimated time: < 1 day";
                }

                return `Estimated time remaining: ${timeString}`;
            }
        }
    }, [
        dailyMaxes,
        regressionData,
        exerciseGoal.goal_weight,
        activeRegressionType,
    ]);

    const chartSpacing = useMemo(() => {
        if (!chartData.actualData || chartData.actualData.length <= 1)
            return 50;

        const screenWidth = Dimensions.get("window").width;
        const horizontalPadding = 100;
        const availableWidth = screenWidth - horizontalPadding;
        const intervals = chartData.actualData.length - 1;

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
            <FlatList
                data={[...exerciseHistory].reverse()}
                keyExtractor={(item, index) =>
                    item.id?.toString() || index.toString()
                }
                renderItem={({ item }) => (
                    <LiftHistoryItem
                        item={item}
                        onPress={() =>
                            router.push(`/workouts/${item.workout_id}`)
                        }
                    />
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        <View className="flex-row justify-center mb-4 mt-2">
                            {(
                                [
                                    "1W",
                                    "1M",
                                    "3M",
                                    "6M",
                                    "1Y",
                                    "All",
                                ] as TimeRange[]
                            ).map((range) => (
                                <TimeFilterButton
                                    key={range}
                                    range={range}
                                    active={selectedRange === range}
                                    onPress={handleTimeRangeChange}
                                />
                            ))}
                        </View>

                        {chartData.actualData.length > 0 && (
                            <View className="items-center">
                                <LineChart
                                    data={chartData.actualData}
                                    data2={
                                        chartData.trendData.length > 0
                                            ? chartData.trendData
                                            : undefined
                                    }
                                    height={250}
                                    thickness={2}
                                    thickness2={2}
                                    color="#ffffff"
                                    color2="#60a5fa"
                                    initialSpacing={10}
                                    spacing={chartSpacing}
                                    hideRules
                                    yAxisTextStyle={{
                                        color: "#ffffff",
                                        fontSize: 10,
                                    }}
                                    xAxisLabelTextStyle={{
                                        color: "#ffffff",
                                        fontSize: 10,
                                        width: 40,
                                    }}
                                    yAxisColor="transparent"
                                    xAxisColor="#ffffff"
                                    extrapolateMissingValues={false}
                                />
                            </View>
                        )}

                        {regressionData && (
                            <View className="flex-row justify-center items-center mt-4 mb-2">
                                <TouchableOpacity
                                    onPress={() =>
                                        setSelectedRegression("linear")
                                    }
                                    className={`px-4 py-1.5 rounded-l-full border ${
                                        activeRegressionType === "linear"
                                            ? "bg-blue-400 border-blue-400"
                                            : "border-gray-500"
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-medium ${
                                            activeRegressionType === "linear"
                                                ? "text-white"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        Linear{" "}
                                        {regressionData.recommended ===
                                            "linear" && "★"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                        setSelectedRegression("logarithmic")
                                    }
                                    className={`px-4 py-1.5 rounded-r-full border border-l-0 ${
                                        activeRegressionType === "logarithmic"
                                            ? "bg-blue-400 border-blue-400"
                                            : "border-gray-500"
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-medium ${
                                            activeRegressionType ===
                                            "logarithmic"
                                                ? "text-white"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        Logarithmic{" "}
                                        {regressionData.recommended ===
                                            "logarithmic" && "★"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View className="mt-4 mb-10">
                            <View className="flex-row items-center justify-center">
                                <Text className="text-foreground">
                                    Goal (1RM):
                                </Text>
                                <TextInput
                                    className="text-xl text-foreground font-bold mx-2 bg-secondary rounded-md px-3 py-1 text-center"
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
                                        canSave
                                            ? "bg-primary"
                                            : "bg-muted opacity-50"
                                    }`}
                                >
                                    {saving ? (
                                        <ActivityIndicator
                                            color="#fff"
                                            size="small"
                                        />
                                    ) : (
                                        <Text
                                            className={`${canSave ? "text-primary-foreground" : "text-muted-foreground"} font-bold`}
                                        >
                                            Save
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {predictionText && (
                                <Text className="text-muted-foreground text-center mt-3 text-sm">
                                    {predictionText}
                                </Text>
                            )}
                        </View>

                        <Text className="text-foreground text-xl font-bold mb-4 px-4">
                            History
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <Text className="text-muted-foreground text-center py-10 px-4">
                        No recorded lifts yet.
                    </Text>
                }
            />
        </ScreenStateWrapper>
    );
}
