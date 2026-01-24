import { useState, useEffect } from "react";
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteTemplate, fetchTemplate, updateTemplate } from "@/services/api";
import { WorkoutTemplate, WorkoutTemplateFormData } from "@/types";
import TemplateForm from "./_components/TemplateForm";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";

export default function TemplateDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
    const [loading, setLoading] = useState(true);

    const getTemplate = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetchTemplate(id);
            setTemplate(res.data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch template");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTemplate();
    }, [id]);

    const handleUpdateSubmit = async (formData: WorkoutTemplateFormData) => {
        if (!id) return;
        try {
            await updateTemplate(id, formData);
            Alert.alert("Success", "Template updated successfully!");
            getTemplate();
        } catch (error) {
            Alert.alert("Error", "Failed to update template.");
            console.error(error);
        }
    };

    const handleDeleteTemplate = () => {
        Alert.alert(
            "Delete Template",
            "Are you sure you want to delete this template?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTemplate(id);
                            Alert.alert(
                                "Success",
                                "Template deleted successfully!",
                            );
                            router.back();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete template.");
                            console.error(error);
                        }
                    },
                },
            ],
        );
    };

    return (
        <ScreenStateWrapper
            isLoading={loading}
            isNotFound={!template}
            notFoundMessage={["Template not found."]}
        >
            {template && (
                <View className="flex-1 bg-background">
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
                        <TemplateForm
                            initialFormData={template}
                            onSubmit={handleUpdateSubmit}
                            submitButtonText="Save Changes"
                        />
                        <TouchableOpacity
                            className="py-3 px-6 rounded-xl bg-red-600 flex-1 m-5"
                            onPress={handleDeleteTemplate}
                        >
                            <Text className="text-white text-center font-bold">
                                Delete Template
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}
        </ScreenStateWrapper>
    );
}
