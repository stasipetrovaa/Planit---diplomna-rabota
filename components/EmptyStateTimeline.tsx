import React from "react";
import { StyleSheet, View, Text } from "react-native";
import AgendaItem from "./ui/AgendaItem";
import { EventType } from "@/types/types";
import { Colors } from "@/constants/Colors";

const EXAMPLE_EVENTS: EventType[] = [
    {
        id: "example-1",
        title: "Morning Jog (Example)",
        startDate: new Date(),
        endDate: new Date(),
        startTime: new Date(new Date().setHours(8, 0)),
        endTime: new Date(new Date().setHours(8, 45)),
        repeat: "none",
        color: "#4CAF50",
        completed: false,
    },
    {
        id: "example-2",
        title: "Team Sync (Example)",
        startDate: new Date(),
        endDate: new Date(),
        startTime: new Date(new Date().setHours(10, 0)),
        endTime: new Date(new Date().setHours(11, 0)),
        repeat: "weekly",
        color: "#2196F3",
        completed: false,
    },
    {
        id: "example-3",
        title: "Lunch with Sarah (Example)",
        startDate: new Date(),
        endDate: new Date(),
        startTime: new Date(new Date().setHours(12, 30)),
        endTime: new Date(new Date().setHours(13, 30)),
        repeat: "none",
        color: "#9C27B0",
        completed: false,
    },
];

const EmptyStateTimeline = () => {
    const formatHour = (date: Date) => {
        const hour = date.getHours();
        if (hour === 0) return "12 AM";
        if (hour === 12) return "12 PM";
        if (hour < 12) return `${hour} AM`;
        return `${hour - 12} PM`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                Your day is empty. {'\n'}Tap + to add a task!
            </Text>
            <View style={styles.timelineContainer}>
                {EXAMPLE_EVENTS.map((item, index) => (
                    <View key={item.id} style={styles.timelineRow}>
                        <View style={styles.timeColumn}>
                            <Text style={styles.timeText}>{formatHour(item.startTime)}</Text>
                        </View>
                        <View style={styles.eventsColumn}>
                            <View style={styles.ghostItem}>
                                <AgendaItem
                                    item={item}
                                    onPress={() => { }}
                                    showCheckbox={false}
                                />
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 32,
        alignItems: "center",
    },
    headerText: {
        fontFamily: "Montserrat",
        fontSize: 16,
        color: Colors.placeholderText,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 24,
    },
    timelineContainer: {
        width: "100%",
        opacity: 0.5, // Make everything look ghost-like
    },
    timelineRow: {
        flexDirection: "row",
        marginBottom: 8,
        width: "100%",
    },
    timeColumn: {
        width: 70,
        paddingTop: 16,
        paddingLeft: 16,
        alignItems: "flex-start",
    },
    timeText: {
        fontSize: 12,
        fontFamily: "MontserratBold",
        color: "#999",
    },
    eventsColumn: {
        flex: 1,
        paddingRight: 16,
    },
    ghostItem: {
        // Optional additional ghost styling
    }
});

export default EmptyStateTimeline;
