import { useState, useCallback } from "react";
import { ScrollView, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
    fetchWorkoutList,
    deleteWorkout,
    updateWorkoutDate,
} from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import { Workout } from "@/types";
import BottomSheetModal from "@/components/common/bottom-sheet-modal";
import ModalActionRow from "@/components/common/modal-action-row";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";
import FloatingActionButton from "@/components/common/floating-action-button";
import WorkoutListItem from "./_components/WorkoutListItem";
import DateTimePickerForm from "@/components/common/date-time-picker-form";

export default function WorkoutListScreen() {
    const router = useRouter();

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showDatetimeModal, setShowDatetimeModal] = useState<boolean>(false);
    const [date, setDate] = useState(new Date());
    const [selectedWorkoutID, setSelectedWorkoutID] = useState<number>();

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
        }, [getWorkouts]),
    );

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
            ],
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

            <BottomSheetModal
                visible={showDatetimeModal}
                onClose={handleHideDatetimeModal}
            >
                <DateTimePickerForm date={date} onDateChange={setDate} />
                <ModalActionRow
                    text="Save"
                    onPress={handleUpdateWorkoutDate}
                    centred
                />
            </BottomSheetModal>
        </View>
    );
}
