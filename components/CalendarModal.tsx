import { Colors } from "@/constants/Colors";
import { useCalendar } from "@/contexts/calendar-context";
import { Feather } from "@expo/vector-icons";
import { memo } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const CalendarModal = ({ visible, onClose, selectedDate, onDateSelect }: CalendarModalProps) => {
    const { events } = useCalendar();

    const todayToString = selectedDate.toISOString().split("T")[0];

    // Mark dates that have events
    const markedDates: any = {};
    events.forEach((event) => {
        const dateStr = new Date(event.startDate).toISOString().split("T")[0];
        if (!markedDates[dateStr]) {
            markedDates[dateStr] = {
                marked: true,
                dotColor: event.color || Colors.tabIconSelected,
            };
        }
    });

    // Highlight selected date
    markedDates[todayToString] = {
        ...markedDates[todayToString],
        selected: true,
        selectedColor: Colors.tabIconSelected,
    };

    const handleDayPress = (day: any) => {
        const newDate = new Date(day.dateString);
        onDateSelect(newDate);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Select Date</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <Calendar
                        current={todayToString}
                        markedDates={markedDates}
                        onDayPress={handleDayPress}
                        theme={{
                            selectedDayBackgroundColor: Colors.tabIconSelected,
                            selectedDayTextColor: "white",
                            todayTextColor: Colors.tabIconSelected,
                            dotColor: Colors.tabIconSelected,
                            textDayFontFamily: "Montserrat",
                            textMonthFontFamily: "MontserratBold",
                            textDayHeaderFontFamily: "MontserratBold",
                            textDayFontSize: 16,
                            textMonthFontSize: 18,
                            monthTextColor: "#1A1A1A",
                            arrowColor: Colors.tabIconSelected,
                        }}
                        style={styles.calendar}
                    />

                    <TouchableOpacity onPress={onClose} style={styles.doneButton} activeOpacity={0.8}>
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default memo(CalendarModal);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: "MontserratBold",
        color: "#1A1A1A",
    },
    closeButton: {
        padding: 4,
    },
    calendar: {
        borderRadius: 12,
    },
    doneButton: {
        backgroundColor: Colors.tabIconSelected,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 16,
        alignItems: "center",
    },
    doneButtonText: {
        color: "white",
        fontSize: 16,
        fontFamily: "MontserratBold",
    },
});
