import React, { useState, useCallback } from "react";
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import api from "@/services/api";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { WorkoutTemplate } from "@/types";

export default function TemplateScreen() {
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const getTemplates = useCallback(() => {
        setLoading(true);
        api.get<WorkoutTemplate[]>("/workout-templates/")
            .then((result) => {
                setTemplates(result.data);
            })
            .catch((err: Error) => {
                console.error(err);
                Alert.alert("Error", "Failed to fetch templates.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useFocusEffect(
        useCallback(() => {
            getTemplates();
        }, [getTemplates])
    );

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
                            className="bg-background rounded-2xl p-4 mb-4 shadow-md border border-border"
                            onPress={() =>
                                router.push(`/templates/${template.id}`)
                            }
                        >
                            <Text className="text-foreground font-bold text-xl">
                                {template.name}
                            </Text>
                            {template.notes && (
                                <Text className="text-muted-foreground mt-1">
                                    {template.notes}
                                </Text>
                            )}
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
        </View>
    );
}
