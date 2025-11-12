import React, { useState, useCallback } from "react";
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import {
    fetchTemplateList,
    deleteTemplate,
    duplicateTemplate,
} from "@/services/api";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { WorkoutTemplate } from "@/types";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useThemeColors } from "@/hooks/useThemeColors";
import BottomSheetModal from "@/components/common/bottom-sheet-modal";
import ModalActionRow from "@/components/common/modal-action-row";
import ScreenStateWrapper from "@/components/common/screen-state-wrapper";

export default function TemplateScreen() {
    const themeColors = useThemeColors();
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedTemplateID, setSelectedTemplateID] = useState<number>();
    const router = useRouter();

    const getTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchTemplateList();
            setTemplates(res.data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch templates.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            getTemplates();
        }, [getTemplates])
    );

    const handleShowModal = (templateID: number) => {
        setSelectedTemplateID(templateID);
        setShowModal(true);
    };

    const handleHideModal = () => {
        setSelectedTemplateID(undefined);
        setShowModal(false);
    };

    const handleDeleteTemplate = (id: number) => {
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
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete template.");
                            console.error(error);
                        } finally {
                            handleHideModal();
                            getTemplates();
                        }
                    },
                },
            ]
        );
    };

    const handleDuplicateTemplate = async () => {
        if (!selectedTemplateID) return;
        try {
            const res = await duplicateTemplate(selectedTemplateID);
            setTemplates((prev) => [...prev, res.data]);
        } catch (error) {
            Alert.alert(
                "Error",
                "Failed to duplicate template. Please try again."
            );
            console.error(error);
        } finally {
            handleHideModal();
        }
    };

    return (
        <View className="flex-1 bg-background p-2">
            <View className="flex-1">
                <ScreenStateWrapper
                    isLoading={loading}
                    isEmpty={templates.length === 0}
                    emptyMessage={[
                        "No workout templates found,",
                        "Click the + button to create one.",
                    ]}
                >
                    {templates.map((template) => (
                        <TouchableOpacity
                            key={template.id}
                            className="bg-background rounded-2xl p-4 mb-4 flex-row justify-between shadow-md border border-border"
                            onPress={() =>
                                router.push(`/templates/${template.id}`)
                            }
                        >
                            <View className="flex-1">
                                <Text className="text-foreground font-bold text-xl">
                                    {template.name}
                                </Text>
                                {template.notes && (
                                    <Text className="text-muted-foreground mt-1">
                                        {template.notes}
                                    </Text>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={() => handleShowModal(template.id)}
                                className="w-10"
                            >
                                <SimpleLineIcons
                                    name="options"
                                    className="my-auto ml-auto"
                                    size={20}
                                    color={themeColors.foreground}
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </ScreenStateWrapper>
            </View>
            <TouchableOpacity
                className="absolute bottom-28 right-4 w-16 h-16 bg-accent rounded-2xl justify-center items-center shadow-lg shadow-black"
                onPress={() => router.push("/(app)/templates/create")}
            >
                <Text className="text-white text-3xl">+</Text>
            </TouchableOpacity>
            <BottomSheetModal visible={showModal} onClose={handleHideModal}>
                <ModalActionRow
                    text="Duplicate Template"
                    icon="copy-outline"
                    onPress={handleDuplicateTemplate}
                />
                <ModalActionRow
                    text="Delete Template"
                    icon="trash-outline"
                    onPress={() => handleDeleteTemplate(selectedTemplateID!)}
                    isDestructive
                />
            </BottomSheetModal>
        </View>
    );
}
