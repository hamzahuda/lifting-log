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
import api from "@/services/api";
import { WorkoutTemplate, WorkoutTemplateFormData } from "@/types";
import TemplateForm from "./_components/TemplateForm";

export default function TemplateDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
    const [loading, setLoading] = useState(true);

    const getTemplate = () => {
        if (!id) return;
        setLoading(true);
        api.get(`/workout-templates/${id}/`)
            .then((res) => setTemplate(res.data))
            .catch((err) => {
                Alert.alert("Error", "Failed to fetch templates");
                console.error(err);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getTemplate();
    }, [id]);

    const handleUpdateSubmit = (formData: WorkoutTemplateFormData) => {
        api.put(`/workout-templates/${id}/`, formData)
            .then((res) => {
                if (res.status === 200) {
                    Alert.alert("Success", "Template updated successfully!");
                    getTemplate();
                } else {
                    Alert.alert("Error", "Failed to update template.");
                }
            })
            .catch((err) => Alert.alert("Error", err.message));
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
                    onPress: () => {
                        api.delete(`/workout-templates/${id}/`)
                            .then(() => {
                                Alert.alert(
                                    "Success",
                                    "Template deleted successfully!"
                                );
                                router.back();
                            })
                            .catch((err) => {
                                Alert.alert(
                                    "Error",
                                    "Failed to delete template."
                                );
                                console.error(err);
                            });
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!template) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <Text className="text-t-primary">Template not found.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
    );
}
