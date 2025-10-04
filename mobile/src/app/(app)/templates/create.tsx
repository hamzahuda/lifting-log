import { View, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import api from "@/utils/api";
import { WorkoutTemplateFormData } from "@/types";
import TemplateForm from "./_components/TemplateForm";

const BLANK_TEMPLATE: WorkoutTemplateFormData = {
    name: "",
    notes: "",
    exercise_templates: [],
};

export default function CreateTemplateScreen() {
    const router = useRouter();

    const handleCreateSubmit = async (formData: WorkoutTemplateFormData) => {
        try {
            const res = await api.post("/workout-templates/", formData);
            if (res.status === 201) {
                Alert.alert("Success", "Template created successfully!");
                router.back();
            }
        } catch (err) {
            Alert.alert(
                "Error",
                "Failed to create template. Please try again."
            );
            console.log(err);
        }
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <TemplateForm
                    initialFormData={BLANK_TEMPLATE}
                    onSubmit={handleCreateSubmit}
                    submitButtonText="Create Template"
                />
            </ScrollView>
        </View>
    );
}
