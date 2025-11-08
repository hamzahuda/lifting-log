import { useState, useCallback } from "react";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
    Pressable,
    Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import api from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import { Workout } from "@/types";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useColorScheme } from "nativewind";
import { THEME } from "@/utils/theme";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

export default function WorkoutListScreen() {
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const themeColors =
        colorScheme === undefined ? THEME.dark : THEME[colorScheme];

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showDatetimeModal, setShowDatetimeModal] = useState<boolean>(false);
    const [date, setDate] = useState(new Date());
    const [selectedWorkoutID, setSelectedWorkoutID] = useState<number>();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const getWorkouts = useCallback(() => {
        setLoading(true);
        api.get<Workout[]>("/workouts/")
            .then((result) => {
                setWorkouts(result.data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useFocusEffect(
        useCallback(() => {
            getWorkouts();
        }, [getWorkouts])
    );

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === "ios");
        if (Platform.OS === "android") {
            setShowDatePicker(false);
        }
        if (event.type === "set") {
            setDate(currentDate);
        }
    };

    const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
        const currentTime = selectedTime || date;
        setShowTimePicker(Platform.OS === "ios");
        if (Platform.OS === "android") {
            setShowTimePicker(false);
        }
        if (event.type === "set") {
            setDate(currentTime);
        }
    };

    const handleShowModal = (workoutID: number) => {
        setSelectedWorkoutID(workoutID);
        const workoutToEdit = workouts.find((w) => w.id === workoutID);
        if (workoutToEdit) {
            setDate(new Date(workoutToEdit.date));
        }
        setShowModal(true);
    };

    const handleHideModal = () => {
        setSelectedWorkoutID(undefined);
        setShowModal(false);
    };

    const handleHideDatetimeModal = () => {
        setShowDatetimeModal(false);
        setShowDatePicker(false);
        setShowTimePicker(false);
    };

    const handleDeleteWorkout = (id: number) => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                        api
                            .delete(`/workouts/${id}/`)
                            .catch((error) => {
                                console.error(error);
                                Alert.alert(
                                    "Error",
                                    "Failed to delete workout."
                                );
                            })
                            .finally(() => {
                                handleHideModal();
                                getWorkouts();
                            }),
                },
            ]
        );
    };

    const handleUpdateWorkoutDate = () => {
        if (!selectedWorkoutID) return;

        setLoading(true);
        api.patch(`/workouts/${selectedWorkoutID}/`, {
            date: date.toISOString(),
        })
            .then(() => {
                handleHideDatetimeModal();
                handleHideModal();
                getWorkouts();
            })
            .catch((err) => {
                console.error(err);
                Alert.alert("Error", "Failed to update workout date.");
                setLoading(false);
            });
    };

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return (
        <View className="flex-1 bg-background p-2">
            {loading ? (
                <ActivityIndicator className="flex-1" size="large" />
            ) : workouts.length === 0 ? (
                <View className="flex-1 flex-col justify-center mb-60">
                    <Text className="text-muted-foreground text-center">
                        No workouts found,
                    </Text>
                    <Text className="text-muted-foreground text-center">
                        Click the plus button to create one.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 210 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        {workouts.map((workout, index) => (
                            <Card key={workout.id} className="pr-4 py-3 mb-3">
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push(
                                            `/(app)/workouts/${workout.id}`
                                        )
                                    }
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-foreground font-bold text-center text-2xl px-6">
                                            {`${workouts.length - index}`}
                                        </Text>
                                        <View className="flex-col flex-1">
                                            <View className="flex-row items-center">
                                                <Text className="text-foreground font-bold text-2xl flex-1">
                                                    {workout.name}
                                                </Text>
                                                <Text className="text-foreground font-semibold text-lg">
                                                    {new Date(
                                                        workout.date
                                                    ).toLocaleDateString(
                                                        "en-GB"
                                                    )}
                                                </Text>
                                            </View>
                                            <Text className="text-muted-foreground flex-1">
                                                {workout.notes || ""}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            className="ml-4"
                                            onPress={() =>
                                                handleShowModal(workout.id)
                                            }
                                        >
                                            <Ionicons
                                                name="options-sharp"
                                                className="m-auto"
                                                size={24}
                                                color={themeColors.foreground}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </Card>
                        ))}
                    </View>
                </ScrollView>
            )}

            <TouchableOpacity
                className="absolute bottom-28 right-4 w-16 h-16 bg-accent rounded-2xl justify-center items-center shadow-lg shadow-black"
                onPress={() => router.push("/(app)/workouts/create")}
            >
                <Text className="text-white text-3xl">+</Text>
            </TouchableOpacity>

            <Modal
                visible={showModal}
                onRequestClose={handleHideModal}
                animationType="slide"
                transparent={true}
            >
                <Pressable
                    className="flex-1 justify-end"
                    onPress={handleHideModal}
                >
                    <Pressable>
                        <View className="w-full rounded-t-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
                            <TouchableOpacity
                                className="flex-row items-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                                onPress={() => {
                                    setShowModal(false);
                                    setShowDatetimeModal(true);
                                }}
                            >
                                <Ionicons
                                    name="calendar-outline"
                                    size={22}
                                    color={themeColors.foreground}
                                    className="mr-4 dark:text-gray-100"
                                />
                                <Text className="text-lg text-gray-800 dark:text-gray-100">
                                    Edit Date/Time
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                                onPress={() =>
                                    handleDeleteWorkout(selectedWorkoutID!)
                                }
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={22}
                                    color={themeColors.foreground}
                                    className="mr-4"
                                />
                                <Text className="text-lg text-red-600 dark:text-red-500">
                                    Delete Workout
                                </Text>
                            </TouchableOpacity>
                            <Separator className="bg-gray-200 dark:bg-gray-700" />
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                                onPress={handleHideModal}
                            >
                                <Text className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={showDatetimeModal}
                onRequestClose={handleHideDatetimeModal}
                animationType="slide"
                transparent={true}
            >
                <Pressable
                    className="flex-1 justify-end"
                    onPress={handleHideDatetimeModal}
                >
                    <Pressable>
                        <View className="w-full rounded-t-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
                            <Text className="text-foreground text-xl font-bold text-center mb-4">
                                Edit Date & Time
                            </Text>

                            {Platform.OS === "ios" && (
                                <>
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display="inline"
                                        onChange={onChangeDate}
                                        textColor={themeColors.foreground}
                                    />
                                    <DateTimePicker
                                        value={date}
                                        mode="time"
                                        display="spinner"
                                        onChange={onChangeTime}
                                        textColor={themeColors.foreground}
                                    />
                                </>
                            )}

                            {Platform.OS === "android" && (
                                <>
                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker(true)}
                                        className="bg-secondary p-4 rounded-lg items-center mb-4"
                                    >
                                        <Text className="text-foreground text-lg">
                                            {formattedDate}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setShowTimePicker(true)}
                                        className="bg-secondary p-4 rounded-lg items-center mb-8"
                                    >
                                        <Text className="text-foreground text-lg">
                                            {formattedTime}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {showDatePicker && Platform.OS === "android" && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDate}
                                />
                            )}

                            {showTimePicker && Platform.OS === "android" && (
                                <DateTimePicker
                                    value={date}
                                    mode="time"
                                    display="default"
                                    onChange={onChangeTime}
                                />
                            )}

                            <Separator className="bg-gray-200 dark:bg-gray-700 my-2" />
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                                onPress={handleUpdateWorkoutDate}
                            >
                                <Text className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    Save
                                </Text>
                            </TouchableOpacity>
                            <Separator className="bg-gray-200 dark:bg-gray-700" />
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                                onPress={handleHideDatetimeModal}
                            >
                                <Text className="text-lg font-semibold text-red-600 dark:text-red-500">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
