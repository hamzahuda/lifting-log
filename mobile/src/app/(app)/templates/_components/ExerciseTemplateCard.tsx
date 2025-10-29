import { ExerciseTemplate, SetTemplate } from "@/types";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    FlatList,
} from "react-native";
import { HHMMSStoSeconds, secondsToHHMMSS } from "@/utils/time-converter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import * as SQLite from "expo-sqlite";
import { searchExercises, addCustomExercise } from "@/services/localDatabase";
import { ActivityIndicator } from "react-native";

type ExerciseTemplateCardProps = {
    data: ExerciseTemplate;
    onEdit: (exID: number, updatedData: ExerciseTemplate) => void;
    onDelete: (exID: number) => void;
};

export default function ExerciseTemplateCard({
    data,
    onEdit,
    onDelete,
}: ExerciseTemplateCardProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const db = SQLite.useSQLiteContext();

    useEffect(() => {
        const searchDatabase = async () => {
            if (searchQuery.trim() === "") {
                setSearchResults([]);
                return;
            }
            setIsLoadingSearch(true);
            try {
                const results = await searchExercises(db, searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error("Error searching exercises:", error);
                setSearchResults([]);
            } finally {
                setIsLoadingSearch(false);
            }
        };

        const timerId = setTimeout(() => {
            searchDatabase();
        }, 100);

        return () => clearTimeout(timerId);
    }, [searchQuery]);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    const handleSelectExercise = (item: string) => {
        onEdit(data.id, { ...data, name: item });
        resetAndCloseModal();
    };

    const handleCreateNewExercise = async () => {
        const newName = searchQuery.trim();
        if (!newName) return;

        try {
            await addCustomExercise(db, newName);
            onEdit(data.id, { ...data, name: newName });
            resetAndCloseModal();
        } catch (error) {
            console.error("Error creating new exercise:", error);
        }
    };

    const handleMinOrMaxRepsChange = (
        setID: number,
        field: keyof SetTemplate,
        value: string
    ) => {
        const updatedSetTemplates = data.set_templates.map((set) => {
            if (set.id === setID) {
                return { ...set, [field]: parseInt(value) || 0 };
            }
            return set;
        });
        onEdit(data.id, { ...data, set_templates: updatedSetTemplates });
    };

    const handleRestPeriodChange = (adjustment: number) => {
        const currentSeconds = HHMMSStoSeconds(data.rest_period);
        const newSeconds = Math.min(
            3600,
            Math.max(0, currentSeconds + adjustment)
        );
        onEdit(data.id, {
            ...data,
            rest_period: secondsToHHMMSS(newSeconds),
        });
    };

    const handleAddSet = () => {
        let rep_range = { min_reps: 6, max_reps: 8 };
        if (data.set_templates.length > 0) {
            rep_range = {
                min_reps:
                    data.set_templates[data.set_templates.length - 1].min_reps,
                max_reps:
                    data.set_templates[data.set_templates.length - 1].max_reps,
            };
        }

        const newSet: SetTemplate = {
            id: Date.now(),
            notes: "",
            ...rep_range,
        };
        onEdit(data.id, {
            ...data,
            set_templates: [...data.set_templates, newSet],
        });
    };

    const handleDeleteSet = () => {
        onEdit(data.id, {
            ...data,
            set_templates: data.set_templates.filter(
                (s, index) => index !== data.set_templates.length - 1
            ),
        });
    };

    const resetAndCloseModal = () => {
        setModalVisible(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <Card className="mx-5 mb-5 gap-0">
            <CardHeader>
                <TouchableOpacity
                    onPress={() => {
                        setModalVisible(true);
                    }}
                >
                    <Text className="text-foreground font-extrabold text-2xl bg-secondary bg-size rounded-md px-3 py-2 mb-2 mt-5">
                        {data.name ? data.name : "Exercise Name"}
                    </Text>
                </TouchableOpacity>

                <TextInput
                    className="text-foreground text-sm align-middle bg-secondary bg-size rounded-md px-3 py-1 mb-2"
                    value={data.notes}
                    onChangeText={(value) =>
                        onEdit(data.id, { ...data, notes: value })
                    }
                    placeholder="Notes"
                    placeholderTextColor="gray"
                    multiline
                />
            </CardHeader>

            <CardContent>
                <View className="flex-col p-2">
                    <View className="flex-row">
                        <View className="flex-none w-40 flex-row items-center justify-center">
                            <TouchableOpacity
                                onPress={handleDeleteSet}
                                className="bg-red-600 w-5 h-5 rounded-full"
                            >
                                <Text className="text-foreground font-bold text-sm text-center">
                                    -
                                </Text>
                            </TouchableOpacity>
                            <Text className="text-foreground text-lg font-semibold mx-3">
                                Sets
                            </Text>
                            <TouchableOpacity
                                onPress={handleAddSet}
                                className="bg-green-600 w-5 h-5 rounded-full"
                            >
                                <Text className="text-foreground font-bold text-sm text-center">
                                    +
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="flex-1 text-foreground text-center text-lg font-semibold">
                            Reps
                        </Text>
                    </View>

                    {data.set_templates?.map((set, setIndex) => (
                        <View key={set.id} className="flex-row py-1">
                            <Text className="flex-none w-40 text-foreground text-lg text-center align-middle">
                                {setIndex + 1}
                            </Text>
                            <View className="flex-1 flex-row items-center justify-center">
                                <TextInput
                                    className="text-foreground text-lg text-center w-12 py-0 bg-secondary rounded-md"
                                    value={set.min_reps.toString()}
                                    onChangeText={(value) =>
                                        handleMinOrMaxRepsChange(
                                            set.id,
                                            "min_reps",
                                            value
                                        )
                                    }
                                    keyboardType="numeric"
                                    placeholder="--"
                                    placeholderTextColor="#9CA3AF"
                                />
                                <Text className="text-foreground text-lg mx-2">
                                    -
                                </Text>
                                <TextInput
                                    className="text-foreground text-lg text-center w-12 py-0 bg-secondary rounded-md"
                                    value={set.max_reps.toString()}
                                    onChangeText={(value) =>
                                        handleMinOrMaxRepsChange(
                                            set.id,
                                            "max_reps",
                                            value
                                        )
                                    }
                                    keyboardType="numeric"
                                    placeholder="--"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>
                    ))}
                </View>

                <View className="flex-row justify-between items-center mt-1 pt-2 border-t border-gray-700">
                    <Text className="text-foreground text-lg font-semibold">
                        Rest Period
                    </Text>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => handleRestPeriodChange(-15)}
                            className="bg-secondary rounded-md px-2 py-1"
                        >
                            <Text className="text-foreground text-sm">
                                -15s
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-xl text-foreground font-bold mx-4">
                            {data.rest_period.substring(3)}
                        </Text>

                        <TouchableOpacity
                            onPress={() => handleRestPeriodChange(15)}
                            className="bg-secondary rounded-md px-2 py-1"
                        >
                            <Text className="text-foreground text-sm">
                                +15s
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </CardContent>

            <TouchableOpacity
                onPress={() => onDelete(data.id)}
                className="absolute top-2 right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center"
            >
                <Text className="text-foreground font-bold text-sm">x</Text>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={resetAndCloseModal}
                // This is to get focus on open plus keyboard open
                onShow={() => {
                    setTimeout(() => {
                        inputRef?.current?.focus();
                    }, 50);
                }}
            >
                <TouchableOpacity
                    className="flex-1 justify-start pt-28 items-center bg-black/60"
                    activeOpacity={1}
                    onPress={resetAndCloseModal}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        className="w-full px-5"
                        onPress={() => {}}
                    >
                        <Card className="gap-0">
                            <CardHeader>
                                <Text className="text-xl font-bold mb-4 text-foreground text-center">
                                    Search Exercises
                                </Text>
                            </CardHeader>
                            <CardContent>
                                <TextInput
                                    className="text-foreground text-lg bg-secondary rounded-md px-4 py-3 mb-4"
                                    placeholder="Start typing to search..."
                                    placeholderTextColor="gray"
                                    value={searchQuery}
                                    onChangeText={handleSearchChange}
                                    ref={inputRef}
                                />
                                <FlatList
                                    className="max-h-60 mb-4 border border-border rounded-md"
                                    keyboardShouldPersistTaps="handled"
                                    data={searchResults}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            className="py-3 px-3 border-b-2 border-border"
                                            onPress={() =>
                                                handleSelectExercise(item)
                                            }
                                        >
                                            <Text className="text-foreground text-lg">
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <View className="p-4 items-center">
                                            {isLoadingSearch ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color="white"
                                                />
                                            ) : (
                                                <Text className="text-muted-foreground text-center">
                                                    {searchQuery
                                                        ? "No results found."
                                                        : "Type to search exercises."}
                                                </Text>
                                            )}
                                        </View>
                                    }
                                />
                                <TouchableOpacity
                                    className={`py-3 rounded-md items-center ${
                                        searchQuery.trim()
                                            ? "bg-primary"
                                            : "bg-secondary"
                                    }`}
                                    onPress={handleCreateNewExercise}
                                    disabled={!searchQuery.trim()}
                                >
                                    <Text
                                        className={`font-bold text-center ${
                                            searchQuery.trim()
                                                ? "text-primary-foreground"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        Create "
                                        {searchQuery.trim() || "New Exercise"}"
                                    </Text>
                                </TouchableOpacity>
                            </CardContent>
                            <TouchableOpacity
                                className="absolute top-2 right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center"
                                onPress={resetAndCloseModal}
                            >
                                <Text className="text-foreground font-bold text-sm">
                                    x
                                </Text>
                            </TouchableOpacity>
                        </Card>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </Card>
    );
}
