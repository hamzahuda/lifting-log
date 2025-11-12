import { useState, useCallback } from "react";
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Alert,
    Modal,
    Pressable,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
    fetchWorkoutList,
    deleteWorkout,
    updateWorkoutDate,
} from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import { Workout } from "@/types";
import { Separator } from "@/components/ui/separator";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useThemeColors } from "@/hooks/useThemeColors";
import BottomSheetModal from "@/components/common/bottom-sheet-modal";
import ModalActionRow from "@/components/common/modal-action-row";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import FloatingActionButton from "@/components/common/floating-action-button";
import WorkoutListItem from "./_components/WorkoutListItem";

export default function WorkoutListScreen() {
    const themeColors = useThemeColors();
    const router = useRouter();

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showDatetimeModal, setShowDatetimeModal] = useState<boolean>(false);
    const [date, setDate] = useState(new Date());
    const [selectedWorkoutID, setSelectedWorkoutID] = useState<number>();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const getWorkouts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchWorkoutList();
            setWorkouts(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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
                    onPress: async () => {
                        try {
                            await deleteWorkout(id);
                        } catch (error) {
                            console.error(error);
                            Alert.alert("Error", "Failed to delete workout.");
                            console.error(error);
                        } finally {
                            handleHideModal();
                            getWorkouts();
                        }
                    },
                },
            ]
        );
    };

    const handleUpdateWorkoutDate = async () => {
        if (!selectedWorkoutID) return;
        try {
            await updateWorkoutDate(selectedWorkoutID, date);
            handleHideDatetimeModal();
            handleHideModal();
            getWorkouts();
        } catch (error) {
            Alert.alert("Error", "Failed to update workout date.");
            console.error(error);
        } finally {
            setLoading(false);
        }
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
            <ScreenStateWrapper
                isLoading={loading}
                isEmpty={workouts.length === 0}
                emptyMessage={[
                    "No workouts found,",
                    "Click the + button to create one.",
                ]}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 210 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        {workouts.map((workout, index) => (
                            <WorkoutListItem
                                key={workout.id}
                                workout={workout}
                                index={index}
                                totalCount={workouts.length}
                                onPress={(id) => router.push(`/workouts/${id}`)}
                                onOptions={(id) => handleShowModal(id)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </ScreenStateWrapper>

            <FloatingActionButton
                onPress={() => router.push("/(app)/workouts/create")}
            />

            <BottomSheetModal visible={showModal} onClose={handleHideModal}>
                <ModalActionRow
                    text="Edit Date/Time"
                    onPress={() => {
                        setShowModal(false);
                        setShowDatetimeModal(true);
                    }}
                    icon="calendar-outline"
                    isDestructive={false}
                />
                <ModalActionRow
                    text="Delete"
                    onPress={() => handleDeleteWorkout(selectedWorkoutID!)}
                    icon="trash-outline"
                    isDestructive={true}
                />
            </BottomSheetModal>

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
