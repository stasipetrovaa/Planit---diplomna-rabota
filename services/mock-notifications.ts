import { EventType } from "@/types/types";
import { Alert, Platform } from "react-native";

const NOTIFICATION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const notifiedEventIds: Set<string> = new Set();

export const checkNotifications = (events: EventType[]) => {
    const now = new Date();

    events.forEach((event) => {
        if (event.completed) return;

        const startTime = new Date(event.startDate);
        startTime.setHours(event.startTime.getHours());
        startTime.setMinutes(event.startTime.getMinutes());

        const diff = startTime.getTime() - now.getTime();

        // If event is within the window (e.g. 0 to 10 mins from now)
        // AND hasn't been notified yet
        if (diff > 0 && diff <= NOTIFICATION_WINDOW_MS && !notifiedEventIds.has(event.id || "")) {
            triggerNotification(event);
            if (event.id) notifiedEventIds.add(event.id);
        }
    });
};

const triggerNotification = (event: EventType) => {
    const timeString = formatTime(event.startTime);

    if (Platform.OS === "web") {
        // On web, we can use window.alert or a custom toast. Alert is simple.
        // Making it async to not block main thread logic
        setTimeout(() => {
            window.alert(`🔔 Upcoming Task\n\n"${event.title}" starts at ${timeString}`);
        }, 100);
    } else {
        Alert.alert(
            "🔔 Upcoming Task",
            `"${event.title}" starts at ${timeString}`,
            [{ text: "OK" }]
        );
    }
};

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
