import { useState, useCallback } from "react";
import {
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import { Workout } from "@/types";
import { Card } from "@/components/ui/card";

export default function WorkoutListScreen() {
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
        <View className="flex-1 bg-background p-2">
            {loading ? (
                <ActivityIndicator className="flex-1" size="large" />
            ) : workouts.length === 0 ? (
                <View className="flex-1 flex-col justify-center mb-60">
                    <Text className="text-muted-foreground text-center">
                        No workouts found,
                    </Text>
                    <Text className="text-muted-foreground text-center">
                        Click the plus button to create one.
                    </Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 210 }}>
                    <View>
                        {workouts.map((workout, index) => (
                            <Card key={workout.id} className="pr-4 py-3 mb-3">
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push(
                                            `/(app)/workouts/${workout.id}`
                                        )
                                    }
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-foreground font-bold text-center text-2xl px-6">
                                            {`${workouts.length - index}`}
                                        </Text>
                                        <View className="flex-col flex-1">
                                            <View className="flex-row items-center">
                                                <Text className="text-foreground font-bold text-2xl flex-1">
                                                    {workout.name}
                                                </Text>
                                                <Text className="text-foreground font-semibold text-lg">
                                                    {new Date(
                                                        workout.date
                                                    ).toLocaleDateString(
                                                        "en-GB"
                                                    )}
                                                </Text>
                                            </View>
                                            <Text className="text-muted-foreground flex-1">
                                                {workout.notes || ""}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Card>
                        ))}
                    </View>
                </ScrollView>
            )}

            <TouchableOpacity
                className="absolute bottom-28 right-4 w-16 h-16 bg-accent rounded-2xl justify-center items-center shadow-lg shadow-black"
                onPress={() => router.push("/(app)/workouts/create")}
            >
                <Text className="text-white text-3xl">+</Text>
            </TouchableOpacity>
        </View>
    );
}
