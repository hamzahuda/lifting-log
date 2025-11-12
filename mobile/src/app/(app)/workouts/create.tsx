import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { fetchTemplateList, createWorkout } from "@/services/api";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { WorkoutTemplate } from "@/types";

export default function CreateWorkoutScreen() {
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
        null
    );
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
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
        <View className="flex-1 bg-background p-5 pt-2">
            <Text className="text-foreground text-lg mb-2">Template:</Text>
            <View className="bg-secondary rounded-lg mb-6 pl-2">
                <Picker>
                    {templates.map((template) => (
                        <Picker.Item
                            key={template.id}
                            label={template.name}
                            value={template.url}
                        />
                    ))}
                </Picker>
            </View>

            <Text className="text-foreground text-lg mb-2">Date:</Text>
            <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-secondary p-4 rounded-lg items-center mb-4"
            >
                <Text className="text-foreground text-lg">{formattedDate}</Text>
            </TouchableOpacity>

            <Text className="text-foreground text-lg mb-2">Time:</Text>
            <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-secondary p-4 rounded-lg items-center mb-8"
            >
                <Text className="text-foreground text-lg">{formattedTime}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={onChangeTime}
                />
            )}

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
