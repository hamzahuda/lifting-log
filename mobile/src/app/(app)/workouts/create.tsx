import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { fetchTemplateList, createWorkout } from "@/services/api";
import { Picker } from "@react-native-picker/picker";
import { WorkoutTemplate } from "@/types";
import DateTimePickerForm from "@/components/common/date-time-picker-form";

export default function CreateWorkoutScreen() {
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
        null,
    );
    const [date, setDate] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const getTemplates = async () => {
        try {
            const res = await fetchTemplateList();
            if (res.data && res.data.length > 0) {
                setSelectedTemplate(res.data[0].url);
            }
            setTemplates(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getTemplates();
    }, []);

    const handleSubmit = async () => {
        if (!selectedTemplate) {
            Alert.alert("Error", "Please select a workout template.");
            return;
        }

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const res = await createWorkout(selectedTemplate, date);
            router.replace(`/(app)/workouts/${res.data.id}`);
        } catch (error) {
            Alert.alert("Error", "Failed to create workout. Please try again.");
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-background p-5 pt-2">
            <Text className="text-foreground text-lg mb-2">Template:</Text>
            <View className="bg-secondary rounded-lg mb-6 pl-2">
                <Picker
                    selectedValue={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                >
                    {templates.map((template) => (
                        <Picker.Item
                            key={template.id}
                            label={template.name}
                            value={template.url}
                        />
                    ))}
                </Picker>
            </View>

            <DateTimePickerForm date={date} onDateChange={setDate} />

            <TouchableOpacity
                className="py-3 px-6 rounded-xl bg-green-600 absolute bottom-28 mb-1 left-5 right-5"
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                <Text className="text-foreground text-center font-bold text-lg">
                    {isSubmitting ? "Creating..." : "Create Workout"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
