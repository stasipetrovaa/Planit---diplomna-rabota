import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { EventType } from "@/types/types";

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const NotificationService = {
    // 1. Request Permissions
    registerForPushNotificationsAsync: async () => {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== "granted") {
                console.log("Failed to get push token for push notification!");
                return;
            }
        } else {
            console.log("Must use physical device for Push Notifications");
        }
    },

    // 2. Schedule a Reminder (Rule-based Agent Logic)
    scheduleReminder: async (event: EventType) => {
        const start = new Date(event.startDate);
        start.setHours(event.startTime.getHours(), event.startTime.getMinutes(), 0, 0);

        const now = Date.now();
        let triggerDate = new Date(start.getTime() - (15 * 60 * 1000));
        let body = `"${event.title}" starts in 15 minutes!`;

        // Adaptive Logic:
        if (triggerDate.getTime() <= now) {
            // Remind at start
            triggerDate = start;
            body = `"${event.title}" is starting now! 🔔`;
        }

        // If even start time is past, set to 5 seconds from now for immediate alert
        if (triggerDate.getTime() <= now) {
            triggerDate = new Date(now + 5000);
        }

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "PlanIt Reminder 🔔",
                    body: body,
                    data: { eventId: event.id },
                    sound: "default",
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate
                },
            });
            console.log(`Scheduled adaptive notification for ${event.title} at ${triggerDate.toLocaleTimeString()}`);
            return id;
        } catch (e) {
            console.error("Error scheduling notification:", e);
        }
    },

    // 2.5 Schedule Custom Reminder (AI or Manual)
    scheduleCustomReminder: async (event: EventType, triggerDate: Date, message: string) => {
        const now = Date.now();
        let finalTrigger = triggerDate;

        // If time has passed, fire in 5 seconds as a "just missed/suggestion" alert
        if (triggerDate.getTime() <= now) {
            finalTrigger = new Date(now + 5000);
        }

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "PlanIt AI ⚡",
                    body: message,
                    data: { eventId: event.id },
                    sound: "default",
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate
                },
            });
            console.log(`Scheduled custom notification at ${triggerDate.toLocaleTimeString()}`);
            return id;
        } catch (e) {
            console.error("Error scheduling custom notification:", e);
        }
    },

    // 3. Cancel Reminder
    cancelReminder: async (notificationId: string) => {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    },
};
