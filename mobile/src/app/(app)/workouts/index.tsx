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
        <View className="flex-1 bg-background">
            {loading ? (
                <ActivityIndicator className="flex-1" size="large" />
            ) : (
                <ScrollView
                    className="p-5 pt-6"
                    contentContainerStyle={{ paddingBottom: 210 }}
                >
                    <View>
                        {workouts.map((workout, index) => (
                            <Card key={workout.id} className="p-4 mb-4">
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push(
                                            `/(app)/workouts/${workout.id}`
                                        )
                                    }
                                >
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-foreground font-bold text-xl ml-1 mr-6">
                                            {`${workouts.length - index}`}
                                        </Text>
                                        <View className="flex-col">
                                            <Text className="text-foreground font-bold text-xl">
                                                {workout.name}
                                            </Text>
                                            <Text className="text-muted-foreground flex-1 mr-2">
                                                {workout.notes || ""}
                                            </Text>
                                        </View>

                                        <Text className="text-muted-foreground ml-auto font-semibold text-md mb-auto">
                                            {new Date(
                                                workout.date
                                            ).toLocaleDateString("en-GB")}
                                        </Text>
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
                <Text className="text-white text-3xl bg-back">+</Text>
            </TouchableOpacity>
        </View>
    );
}
