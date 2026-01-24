import { View, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { createTemplate } from "@/services/api";
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
            await createTemplate(formData);
            Alert.alert("Success", "Template created successfully!");
            router.back();
        } catch (error) {
            Alert.alert(
                "Error",
                "Failed to create template. Please try again.",
            );
            console.log(error);
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
