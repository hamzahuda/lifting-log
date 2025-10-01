import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "@/utils/api";
import { NewWorkoutTemplate } from "@/types";
import TemplateForm from "./_components/TemplateForm";

const BLANK_TEMPLATE: NewWorkoutTemplate = {
    name: "",
    notes: "",
    exercise_templates: [],
};

export default function CreateTemplateScreen() {
    const router = useRouter();

    const handleCreateSubmit = async (formData: NewWorkoutTemplate) => {
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
            <TemplateForm
                initialData={BLANK_TEMPLATE}
                onSubmit={handleCreateSubmit}
                buttonTitle="Create Template"
            />
        </View>
    );
}
