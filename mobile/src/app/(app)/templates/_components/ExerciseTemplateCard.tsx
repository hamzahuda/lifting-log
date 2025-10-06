import { ExerciseTemplate, SetTemplate } from "@/types";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Touchable,
} from "react-native";
import { HHMMSStoSeconds, secondsToHHMMSS } from "@/utils/time-converter";

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

    return (
        <View className="bg-primary rounded-2xl pt-5 px-8 pb-4 mb-5 shadow-md  mx-5">
            <TextInput
                className="text-t-primary font-extrabold text-2xl bg-secondary bg-size rounded-md px-3 py-1 mb-2 mt-5"
                value={data.name}
                onChangeText={(value) =>
                    onEdit(data.id, { ...data, name: value })
                }
                placeholder="Exercise Name"
                placeholderTextColor="gray"
            />
            <TextInput
                className="text-t-secondary text-sm align-middle bg-secondary bg-size rounded-md px-3 py-1 mb-2"
                value={data.notes}
                onChangeText={(value) =>
                    onEdit(data.id, { ...data, notes: value })
                }
                placeholder="Notes"
                placeholderTextColor="gray"
                multiline
            />

            {/* Set Templates Section */}
            <View className="flex-col p-2">
                <View className="flex-row">
                    <View className="flex-none w-40 flex-row items-center justify-center">
                        <TouchableOpacity
                            onPress={handleDeleteSet}
                            className="bg-red-600 w-5 h-5 rounded-full"
                        >
                            <Text className="text-white font-bold text-sm text-center">
                                -
                            </Text>
                        </TouchableOpacity>
                        <Text className="text-t-secondary text-lg font-semibold mx-3">
                            Sets
                        </Text>
                        <TouchableOpacity
                            onPress={handleAddSet}
                            className="bg-green-600 w-5 h-5 rounded-full"
                        >
                            <Text className="text-white font-bold text-sm text-center">
                                +
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="flex-1 text-t-secondary text-center text-lg font-semibold">
                        Reps
                    </Text>
                </View>

                {data.set_templates?.map((set, setIndex) => (
                    <View key={set.id} className="flex-row py-1">
                        <Text className="flex-none w-40 text-t-tertiary text-lg text-center align-middle">
                            {setIndex + 1}
                        </Text>
                        <View className="flex-1 flex-row items-center justify-center">
                            <TextInput
                                className="text-t-tertiary text-lg text-center w-12 py-0 bg-secondary rounded-md"
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
                            <Text className="text-t-secondary text-lg mx-2">
                                -
                            </Text>
                            <TextInput
                                className="text-t-tertiary text-lg text-center w-12 py-0 bg-secondary rounded-md"
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
                <Text className="text-t-secondary text-lg font-semibold">
                    Rest Period
                </Text>
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => handleRestPeriodChange(-15)}
                        className="bg-secondary rounded-md px-2 py-1"
                    >
                        <Text className="text-t-primary text-sm">-15s</Text>
                    </TouchableOpacity>

                    <Text className="text-xl text-t-primary font-bold mx-4">
                        {data.rest_period.substring(3)}
                    </Text>

                    <TouchableOpacity
                        onPress={() => handleRestPeriodChange(15)}
                        className="bg-secondary rounded-md px-2 py-1"
                    >
                        <Text className="text-t-primary text-sm">+15s</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => onDelete(data.id)}
                className="absolute top-2 right-2 bg-red-600 rounded-full w-6 h-6 items-center justify-center"
            >
                <Text className="text-white font-bold text-sm">x</Text>
            </TouchableOpacity>
        </View>
    );
}
