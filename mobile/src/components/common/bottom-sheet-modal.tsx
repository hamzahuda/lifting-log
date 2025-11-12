import { Modal, Pressable, Text, View, TouchableOpacity } from "react-native";
import { Separator } from "@/components/ui/separator";
import React from "react";

type BottomSheetModalProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export default function BottomSheetModal({
    visible,
    onClose,
    children,
}: BottomSheetModalProps) {
    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            animationType="slide"
            transparent={true}
        >
            <Pressable className="flex-1 justify-end" onPress={onClose}>
                <Pressable>
                    <View className="w-full rounded-t-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
                        {children}
                        <Separator className="bg-gray-200 dark:bg-gray-700 mt-1" />
                        <TouchableOpacity
                            className="flex-row items-center justify-center rounded-lg p-3 active:bg-gray-100 dark:active:bg-gray-700"
                            onPress={onClose}
                        >
                            <Text className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
