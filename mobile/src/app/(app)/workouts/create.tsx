import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import api from "@/utils/api";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { WorkoutTemplate } from "@/types";
import colors from "@/styles/colors";

export default function CreateWorkoutScreen() {
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
        null
    );
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        api.get<WorkoutTemplate[]>("/workout-templates/")
            .then((res) => {
                setTemplates(res.data);
                if (res.data && res.data.length > 0) {
                    setSelectedTemplate(res.data[0].url);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === "ios");
        setDate(currentDate);
    };

    const handleSubmit = async () => {
        if (!selectedTemplate) {
            Alert.alert("Error", "Please select a workout template.");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        const payload = {
            template: selectedTemplate,
            date: date.toISOString().split("T")[0],
        };

        try {
            const res = await api.post("/workouts/", payload);
            if (res.status === 201) {
                router.push(`/(app)/workouts/${res.data.id}`);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to create workout. Please try again.");
            console.log(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <View className="flex-1 bg-background p-5 pt-6">
            <Text className="text-t-secondary text-lg mb-2">Template:</Text>
            <View className="bg-secondary rounded-lg mb-6 pl-2">
                <Picker
                    selectedValue={selectedTemplate}
                    onValueChange={(itemValue) =>
                        setSelectedTemplate(itemValue)
                    }
                    style={{ color: colors.textPrimary }}
                    dropdownIconColor={colors.textPrimary}
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

            <Text className="text-t-secondary text-lg mb-2">Date:</Text>
            <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-secondary p-4 rounded-lg items-center mb-8"
            >
                <Text className="text-t-primary text-lg">{formattedDate}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            <TouchableOpacity
                className={`py-4 rounded-xl ${isSubmitting ? "bg-gray-500" : "bg-accent"}`}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                <Text className="text-white text-center font-bold text-lg">
                    {isSubmitting ? "Creating..." : "Create Workout"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
