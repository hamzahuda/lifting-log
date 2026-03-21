import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    Alert,
    Modal,
    TouchableOpacity,
} from "react-native";
import * as SQLite from "expo-sqlite";
import {
    addCustomExercise,
    getAllCustomExercises,
    updateCustomExercise,
    deleteCustomExercise,
} from "@/services/localDatabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FloatingActionButton from "@/components/common/floating-action-button";
import { LucideEdit2, LucideTrash2 } from "lucide-react-native";

export default function ManageCustomExercisesScreen() {
    const [exercises, setExercises] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [editingExercise, setEditingExercise] = useState<{
        oldName: string;
        newName: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const inputRef = useRef<TextInput>(null);
    const db = SQLite.useSQLiteContext();

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        setIsLoading(true);
        try {
            const data = await getAllCustomExercises(db);
            setExercises(data);
        } catch (error) {
            console.error("Error loading exercises:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingExercise?.newName.trim()) return;

        try {
            if (editingExercise.oldName) {
                await updateCustomExercise(
                    db,
                    editingExercise.oldName,
                    editingExercise.newName.trim(),
                );
            } else {
                await addCustomExercise(db, editingExercise.newName.trim());
            }
            setModalVisible(false);
            setEditingExercise(null);
            loadExercises();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to save exercise.");
        }
    };

    const confirmDelete = (name: string) => {
        Alert.alert(
            "Delete Exercise",
            `Are you sure you want to delete "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteCustomExercise(db, name);
                        loadExercises();
                    },
                },
            ],
        );
    };

    const openModal = (name: string = "") => {
        setEditingExercise({ oldName: name, newName: name });
        setModalVisible(true);
    };

    const filteredExercises = exercises.filter((ex) =>
        ex.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <View className="flex-1 bg-background p-5">
            <TextInput
                className="bg-secondary text-foreground p-4 rounded-lg mb-4"
                placeholder="Search your custom exercises..."
                placeholderTextColor="gray"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between bg-secondary p-4 rounded-lg mb-2">
                        <Text className="text-foreground text-lg flex-1">
                            {item}
                        </Text>
                        <View className="flex-row gap-4">
                            <TouchableOpacity onPress={() => openModal(item)}>
                                <LucideEdit2 size={20} color="#60a5fa" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => confirmDelete(item)}
                            >
                                <LucideTrash2 size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text className="text-muted-foreground text-center mt-10">
                        {isLoading
                            ? "Loading..."
                            : "No custom exercises found."}
                    </Text>
                }
            />

            <FloatingActionButton onPress={() => openModal()} />

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onShow={() => setTimeout(() => inputRef.current?.focus(), 50)}
            >
                <TouchableOpacity
                    className="flex-1 justify-center items-center bg-black/60 px-5"
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        className="w-full"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Card>
                            <CardHeader>
                                <Text className="text-xl font-bold text-foreground text-center">
                                    {editingExercise?.oldName
                                        ? "Edit Exercise"
                                        : "New Custom Exercise"}
                                </Text>
                            </CardHeader>
                            <CardContent>
                                <TextInput
                                    ref={inputRef}
                                    className="text-foreground text-lg bg-secondary rounded-md px-4 py-3 mb-4"
                                    value={editingExercise?.newName}
                                    onChangeText={(text) =>
                                        setEditingExercise((prev) =>
                                            prev
                                                ? { ...prev, newName: text }
                                                : null,
                                        )
                                    }
                                    placeholder="Exercise name..."
                                    placeholderTextColor="gray"
                                />
                                <TouchableOpacity
                                    className="bg-primary py-3 rounded-md"
                                    onPress={handleSave}
                                >
                                    <Text className="text-primary-foreground font-bold text-center text-lg">
                                        Save
                                    </Text>
                                </TouchableOpacity>
                            </CardContent>
                        </Card>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
