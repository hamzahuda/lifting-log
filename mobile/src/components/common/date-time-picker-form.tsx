import { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface DateTimePickerFormProps {
    date: Date;
    onDateChange: (newDate: Date) => void;
}

export default function DateTimePickerForm({
    date,
    onDateChange,
}: DateTimePickerFormProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        if (Platform.OS === "android") {
            setShowDatePicker(false);
        }
        if (event.type === "set") {
            onDateChange(currentDate);
        }
    };

    const onChangeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
        const currentTime = selectedTime || date;
        if (Platform.OS === "android") {
            setShowTimePicker(false);
        }
        if (event.type === "set") {
            onDateChange(currentTime);
        }
    };

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    if (Platform.OS === "android") {
        return (
            <View className="mb-4">
                <Text className="text-foreground text-lg mb-2">Date:</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-secondary p-4 rounded-lg items-center mb-4"
                >
                    <Text className="text-foreground text-lg">
                        {formattedDate}
                    </Text>
                </TouchableOpacity>

                <Text className="text-foreground text-lg mb-2">Time:</Text>
                <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    className="bg-secondary p-4 rounded-lg items-center"
                >
                    <Text className="text-foreground text-lg">
                        {formattedTime}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        display="default"
                        onChange={onChangeTime}
                    />
                )}
            </View>
        );
    }

    return null;
}
