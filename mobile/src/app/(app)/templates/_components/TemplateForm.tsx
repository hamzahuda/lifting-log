import { WorkoutTemplateFormData } from "@/types";
import ExerciseTemplateCard from "./ExerciseTemplateCard";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { ExerciseTemplate } from "@/types";

type TemplateFormProps = {
    initialFormData: WorkoutTemplateFormData;
    onSubmit: (formData: WorkoutTemplateFormData) => void;
    submitButtonText: string;
};

export default function TemplateForm({
    initialFormData,
    onSubmit,
    submitButtonText,
}: TemplateFormProps) {
    const [workoutTemplateFormData, setWorkoutTemplateFormData] =
        useState<WorkoutTemplateFormData>(initialFormData);

    const handleExerciseCreate = () => {
        setWorkoutTemplateFormData((workoutTemplateFormData) => ({
            ...workoutTemplateFormData,
            exercise_templates: [
                ...workoutTemplateFormData.exercise_templates,
                {
                    id: Date.now(),
                    name: "",
                    rest_period: "00:02:00",
                    notes: "",
                    set_templates: [],
                },
            ],
        }));
    };

    const handleExerciseEdit = (
        exID: number,
        updatedData: ExerciseTemplate
    ) => {
        setWorkoutTemplateFormData((workoutTemplateFormData) => ({
            ...workoutTemplateFormData,
            exercise_templates: workoutTemplateFormData.exercise_templates.map(
                (ex) => (ex.id === exID ? updatedData : ex)
            ),
        }));
    };

    const handleExerciseDelete = (exID: number) => {
        setWorkoutTemplateFormData((workoutTemplateFormData) => ({
            ...workoutTemplateFormData,
            exercise_templates:
                workoutTemplateFormData.exercise_templates.filter(
                    (ex) => ex.id !== exID
                ),
        }));
    };

    return (
        <View>
            <TextInput
                className="text-4xl text-white font-bold m-4 bg-gray-700 rounded-md px-3 py-3"
                onChangeText={(value) => {
                    setWorkoutTemplateFormData((workoutTemplateFormData) => ({
                        ...workoutTemplateFormData,
                        name: value,
                    }));
                }}
                value={workoutTemplateFormData.name}
                placeholder="Template Name"
                placeholderTextColor="gray"
            />
            <TextInput
                className="text-md text-gray-400 mb-5 mx-4 bg-gray-700 rounded-md px-3 py-1"
                value={workoutTemplateFormData.notes || ""}
                onChangeText={(value) => {
                    setWorkoutTemplateFormData((workoutTemplateFormData) => ({
                        ...workoutTemplateFormData,
                        notes: value,
                    }));
                }}
                placeholder="Notes"
                placeholderTextColor="gray"
                multiline
            />
            {workoutTemplateFormData.exercise_templates.map(
                (exercise_template) => (
                    <ExerciseTemplateCard
                        key={exercise_template.id}
                        data={exercise_template}
                        onEdit={handleExerciseEdit}
                        onDelete={handleExerciseDelete}
                    />
                )
            )}
            <TouchableOpacity
                className="bg-blue-700 p-2 rounded-md w-40 self-center mb-5"
                onPress={handleExerciseCreate}
            >
                <Text className="text-white text-center">Add Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="py-3 px-6 rounded-xl bg-green-600 flex-1 mx-5 my-10"
                onPress={() => onSubmit(workoutTemplateFormData)}
            >
                <Text className="text-white text-center font-bold text-base">
                    {submitButtonText}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
