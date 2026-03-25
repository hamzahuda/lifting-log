import { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
    ScrollView,
    View,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Text,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchWorkout, updateWorkout } from "@/services/api";
import ExerciseCard from "./_components/ExerciseCard";
import useDebounce from "@/hooks/useDebounce";
import { useNavigation } from "expo-router";
import { Workout } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import {
    Pencil,
    Play,
    Pause,
    X,
    Timer as TimerIcon,
} from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { secondsToMMSS } from "@/utils/time-converter";

export default function WorkoutDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showTimerBanner, setShowTimerBanner] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const itemLayouts = useRef<{ [key: number]: number }>({});
    const isInitialLoad = useRef(true);
    const debouncedWorkout = useDebounce(workout, 500);
    const navigation = useNavigation();

    // Makes the title blank while it loads
    useLayoutEffect(() => {
        navigation.setOptions({ title: "" });
    }, [navigation]);

    const getWorkout = async () => {
        if (!id) return;
        try {
            const res = await fetchWorkout(id);
            const apiData = res.data;
            const localData: Workout = {
                ...apiData,
                exercises: apiData.exercises.map((exercise) => ({
                    ...exercise,
                    sets: exercise.sets.map((set) => ({
                        ...set,
                        weight: set.weight?.toString() ?? null,
                        reps: set.reps?.toString() ?? null,
                    })),
                })),
            };

            setWorkout(localData);
            setOriginalWorkout(structuredClone(localData));
        } catch (error) {
            Alert.alert("Error", "Could not load workout details.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getWorkout();
    }, [id]);

    useLayoutEffect(() => {
        if (workout) {
            const workoutDate = new Date(workout.date).toLocaleDateString(
                "en-GB",
                {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                },
            );
            navigation.setOptions({
                title: `${workout.name} - ${workoutDate}`,
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => setIsEditing((prev) => !prev)}
                        className="mr-2"
                    >
                        <Icon
                            as={Pencil}
                            size={20}
                            className={
                                isEditing
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            }
                        />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, workout, isEditing]);

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        const hasChanges =
            JSON.stringify(workout) !== JSON.stringify(originalWorkout);

        if (workout && hasChanges) {
            handleSaveChanges();
        }
    }, [debouncedWorkout]);

    // Timer logic interval
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isTimerRunning && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds((prev) => prev - 1);
            }, 1000);
        } else if (timerSeconds === 0 && isTimerRunning) {
            setIsTimerRunning(false);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isTimerRunning, timerSeconds]);

    const handleStartRestTimer = (seconds: number) => {
        setTimerSeconds(seconds);
        setIsTimerRunning(true);
        setShowTimerBanner(true);
    };

    const toggleTimer = () => setIsTimerRunning((prev) => !prev);

    const closeTimerBanner = () => {
        setShowTimerBanner(false);
        setIsTimerRunning(false);
    };

    const handleSetUpdate = (
        exerciseIndex: number,
        setIndex: number,
        field: "weight" | "reps",
        value: string,
    ) => {
        // Regex to allow only number.number
        const validPattern = /^(\d+\.?\d*)?$/;

        if (!validPattern.test(value)) {
            return;
        }

        setWorkout((currentWorkout) => {
            if (!currentWorkout) return null;

            const newExercises = currentWorkout.exercises.map(
                (exercise, exIndex) => {
                    if (exIndex !== exerciseIndex) {
                        return exercise;
                    }
                    const newSets = exercise.sets.map((set) => ({ ...set }));
                    const newValue = value === "" ? null : value;

                    if (field === "weight") {
                        newSets[setIndex].weight = newValue;
                        newSets[setIndex].isWeightAutofilled = false;

                        if (setIndex === 0) {
                            for (let i = 1; i < newSets.length; i++) {
                                if (
                                    newSets[i].weight === null ||
                                    newSets[i].isWeightAutofilled
                                ) {
                                    newSets[i].weight = newValue;
                                    newSets[i].isWeightAutofilled = true;
                                }
                            }
                        }
                    } else if (field === "reps") {
                        newSets[setIndex].reps = newValue;
                    }

                    return { ...exercise, sets: newSets };
                },
            );

            return { ...currentWorkout, exercises: newExercises };
        });
    };

    const handleAddSet = (exerciseIndex: number) => {
        setWorkout((currentWorkout) => {
            if (!currentWorkout) return null;

            const newExercises = currentWorkout.exercises.map(
                (exercise, exIndex) => {
                    if (exIndex !== exerciseIndex) {
                        return exercise;
                    }

                    const minReps =
                        exercise.sets.length > 0
                            ? exercise.sets[0].min_reps
                            : 0;
                    const maxReps =
                        exercise.sets.length > 0
                            ? exercise.sets[0].max_reps
                            : 0;

                    const newSets = [
                        ...exercise.sets,
                        {
                            id: Date.now(),
                            weight: null,
                            reps: null,
                            min_reps: minReps,
                            max_reps: maxReps,
                            notes: "",
                        },
                    ];

                    return { ...exercise, sets: newSets };
                },
            );

            return { ...currentWorkout, exercises: newExercises };
        });
    };

    const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
        setWorkout((currentWorkout) => {
            if (!currentWorkout) return null;

            const newExercises = currentWorkout.exercises.map(
                (exercise, exIndex) => {
                    if (exIndex !== exerciseIndex) {
                        return exercise;
                    }

                    const newSets = exercise.sets.filter(
                        (_, sIndex) => sIndex !== setIndex,
                    );
                    return { ...exercise, sets: newSets };
                },
            );

            return { ...currentWorkout, exercises: newExercises };
        });
    };

    const handleSaveChanges = async () => {
        if (!workout || isSaving) return;
        try {
            setIsSaving(true);
            await updateWorkout(id, workout);
            setOriginalWorkout(structuredClone(workout));
        } catch (error) {
            Alert.alert("Error", "Could not save changes. Please try again.");
            console.error("Failed to save workout:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNotesChange = (newNotes: string) => {
        setWorkout((currentWorkout) => {
            if (!currentWorkout) return null;
            return {
                ...currentWorkout,
                notes: newNotes,
            };
        });
    };

    return (
        <ScreenStateWrapper
            isLoading={loading}
            isNotFound={!workout}
            notFoundMessage={["Workout not found."]}
        >
            {workout && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={100}
                >
                    <View className="flex-1 bg-background px-2">
                        <ScrollView
                            ref={scrollViewRef}
                            contentContainerStyle={{
                                paddingBottom: 200,
                            }}
                            showsVerticalScrollIndicator={false}
                            keyboardDismissMode="on-drag"
                        >
                            <Textarea
                                className="mb-4 text-foreground"
                                value={workout.notes || ""}
                                onChangeText={handleNotesChange}
                                placeholder="Add workout notes..."
                            />

                            <View className="py-0 gap-0 px-4">
                                {workout.exercises.map((exercise, index) => (
                                    <View
                                        key={exercise.id}
                                        onLayout={(event) => {
                                            itemLayouts.current[index] =
                                                event.nativeEvent.layout.y;
                                        }}
                                    >
                                        <ExerciseCard
                                            exercise={exercise}
                                            exerciseIndex={index}
                                            workoutId={workout.id}
                                            onSetUpdate={handleSetUpdate}
                                            isLast={
                                                index ===
                                                workout.exercises.length - 1
                                            }
                                            isEditing={isEditing}
                                            onAddSet={handleAddSet}
                                            onDeleteSet={handleDeleteSet}
                                            onStartRestTimer={
                                                handleStartRestTimer
                                            }
                                        />
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Floating Timer Banner */}
                        {showTimerBanner && (
                            <View
                                className="absolute left-2 right-2 bg-secondary rounded-xl flex-row items-center justify-between p-4"
                                style={{
                                    bottom: 105,
                                    elevation: 10,
                                }}
                            >
                                <View className="flex-row items-center">
                                    <Icon
                                        as={TimerIcon}
                                        size={28}
                                        className="text-foreground mr-3"
                                    />
                                    <Text className="text-foreground font-bold text-2xl">
                                        {secondsToMMSS(timerSeconds)}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-4">
                                    <TouchableOpacity
                                        onPress={toggleTimer}
                                        className="p-2"
                                    >
                                        <Icon
                                            as={isTimerRunning ? Pause : Play}
                                            size={24}
                                            className="text-foreground"
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={closeTimerBanner}
                                        className="p-2"
                                    >
                                        <Icon
                                            as={X}
                                            size={24}
                                            className="text-foreground"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            )}
        </ScreenStateWrapper>
    );
}
