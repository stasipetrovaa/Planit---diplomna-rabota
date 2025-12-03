import { Colors } from "@/constants/Colors";
import { memo, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

interface DaySelectorProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const HorizontalDaySelector = ({ selectedDate, onDateSelect }: DaySelectorProps) => {
    const scrollViewRef = useRef<ScrollView>(null);

    // Generate 60 days - 30 before and 30 after selected date for smooth scrolling
    const getDays = () => {
        const days = [];
        const baseDate = new Date(selectedDate);

        for (let i = -30; i <= 30; i++) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + i);
            days.push(date);
        }

        return days;
    };

    const days = getDays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Scroll to selected date when it changes
    useEffect(() => {
        // Find the index of the selected date (should be around index 30)
        const selectedIndex = days.findIndex(date => isSameDay(date, selectedDate));
        if (selectedIndex !== -1 && scrollViewRef.current) {
            // Scroll to center the selected date
            // Each button is approximately 76px wide (60 minWidth + 16 padding)
            const scrollPosition = selectedIndex * 76 - 150; // Offset to center
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: Math.max(0, scrollPosition), animated: true });
            }, 100);
        }
    }, [selectedDate]);

    const formatDay = (date: Date) => {
        return date.toLocaleDateString("en-US", { weekday: "short" });
    };

    const formatDate = (date: Date) => {
        return date.getDate();
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
            >
                {days.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, today);

                    return (
                        <TouchableOpacity
                            key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                            style={[
                                styles.dayButton,
                                isSelected && styles.dayButtonSelected,
                            ]}
                            onPress={() => onDateSelect(date)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    isSelected && styles.dayTextSelected,
                                ]}
                            >
                                {formatDay(date)}
                            </Text>
                            <Text
                                style={[
                                    styles.dateText,
                                    isSelected && styles.dateTextSelected,
                                    isToday && !isSelected && styles.todayText,
                                ]}
                            >
                                {formatDate(date)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default memo(HorizontalDaySelector);

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    dayButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#F5F5F5",
        minWidth: 60,
        alignItems: "center",
    },
    dayButtonSelected: {
        backgroundColor: "#D4C5F9",
    },
    dayText: {
        fontSize: 12,
        fontFamily: "Montserrat",
        color: "#666",
        marginBottom: 4,
    },
    dayTextSelected: {
        color: "#5B3FA0",
        fontFamily: "MontserratBold",
    },
    dateText: {
        fontSize: 16,
        fontFamily: "MontserratBold",
        color: "#333",
    },
    dateTextSelected: {
        color: "#5B3FA0",
    },
    todayText: {
        color: Colors.tabIconSelected,
    },
});
