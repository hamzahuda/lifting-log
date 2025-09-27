import { useState, useCallback } from "react";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/utils/api";
import { useFocusEffect } from "@react-navigation/native";

interface Workout {
    id: number;
    name: string;
    date: string;
    notes: string;
}

export default function HomeScreen() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const getWorkouts = useCallback(() => {
        setLoading(true);
        api.get<Workout[]>("/workouts/")
            .then((result) => {
                setWorkouts(result.data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useFocusEffect(
        useCallback(() => {
            getWorkouts();
        }, [])
    );

    return (
        <View className="flex-1 bg-background">
            {loading ? (
                <ActivityIndicator className="flex-1" size="large" />
            ) : (
                <ScrollView
                    className="p-5 pt-6"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View>
                        {workouts.map((workout, index) => (
                            <TouchableOpacity
                                key={workout.id}
                                className="bg-primary rounded-2xl p-4 mb-4 shadow-sm shadow-black"
                                onPress={() =>
                                    router.push(`/(app)/workouts/${workout.id}`)
                                }
                            >
                                <View className="flex-row justify-between items-center mt-1">
                                    <Text className="text-white font-bold text-xl mb-1">
                                        {`${workouts.length - index} - ${workout.name}`}
                                    </Text>
                                    <Text className="text-white font-semibold text-lg mb-1">
                                        {new Date(
                                            workout.date
                                        ).toLocaleDateString("en-GB")}
                                    </Text>
                                </View>

                                <Text className="text-gray-400 flex-1 mr-2">
                                    {workout.notes || ""}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}

            <TouchableOpacity
                className="absolute bottom-4 right-4 w-16 h-16 bg-blue-500 rounded-2xl justify-center items-center shadow-lg"
                onPress={() => router.push("/(app)/workouts/create")}
            >
                <Text className="text-white text-3xl">+</Text>
            </TouchableOpacity>
        </View>
    );
}
