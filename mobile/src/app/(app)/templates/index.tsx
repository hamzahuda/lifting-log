import React, { useState, useCallback } from "react";
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
} from "react-native";
import {
    fetchTemplateList,
    deleteTemplate,
    duplicateTemplate,
} from "@/services/api";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { WorkoutTemplate } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { THEME } from "@/utils/theme";
import { useColorScheme } from "nativewind";
import { Separator } from "@/components/ui/separator";

export default function TemplateScreen() {
    const { colorScheme } = useColorScheme();
    const themeColors =
        colorScheme === undefined ? THEME.dark : THEME[colorScheme];
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
            duplicateTemplate(selectedTemplateID);
        } catch (error) {
            Alert.alert(
                "Error",
                "Failed to duplicate template. Please try again."
            );
            console.error(error);
        } finally {
            handleHideModal();
            getTemplates();
        }
    };

    return (
        <View className="flex-1 bg-background p-2">
            <View className="flex-1">
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                ) : templates.length === 0 ? (
                    <View className="flex-1 flex-col justify-center mb-60">
                        <Text className="text-muted-foreground text-center">
                            No workout templates found,
                        </Text>
                        <Text className="text-muted-foreground text-center">
                            Click the plus button to create one.
                        </Text>
                    </View>
                ) : (
                    templates.map((template) => (
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
                    ))
                )}
            </View>
            <TouchableOpacity
                className="absolute bottom-28 right-4 w-16 h-16 bg-accent rounded-2xl justify-center items-center shadow-lg shadow-black"
                onPress={() => router.push("/(app)/templates/create")}
            >
                <Text className="text-white text-3xl">+</Text>
            </TouchableOpacity>
            <Modal
                visible={showModal}
                onRequestClose={handleHideModal}
                animationType="slide"
                transparent={true}
            >
                <Pressable
                    className="flex-1 justify-end"
                    onPress={handleHideModal}
                >
                    <Pressable>
                        <View className="w-full rounded-t-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
                            <TouchableOpacity
                                className="flex-row items-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                                onPress={handleDuplicateTemplate}
                            >
                                <Ionicons
                                    name="copy-outline"
                                    size={22}
                                    color={themeColors.foreground}
                                    className="mr-4 dark:text-gray-100"
                                />
                                <Text className="text-lg text-gray-800 dark:text-gray-100">
                                    Duplicate Template
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-row items-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                                onPress={() =>
                                    handleDeleteTemplate(selectedTemplateID!)
                                }
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={22}
                                    color={themeColors.foreground}
                                    className="mr-4"
                                />
                                <Text className="text-lg text-red-600 dark:text-red-500">
                                    Delete Template
                                </Text>
                            </TouchableOpacity>
                            <Separator className="bg-gray-200 dark:bg-gray-700" />
                            <TouchableOpacity
                                className="flex-row items-center justify-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                                onPress={handleHideModal}
                            >
                                <Text className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
