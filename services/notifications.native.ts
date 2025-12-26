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
        const triggerDate = new Date(event.startDate);
        triggerDate.setHours(event.startTime.getHours());
        triggerDate.setMinutes(event.startTime.getMinutes());

        // Subtract 15 minutes
        triggerDate.setMinutes(triggerDate.getMinutes() - 15);

        // Don't schedule if time has passed
        if (triggerDate.getTime() < Date.now()) return;

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Upcoming Task 🔔",
                    body: `"${event.title}" starts in 15 minutes!`,
                    data: { eventId: event.id },
                    sound: "default",
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate
                },
            });
            console.log(`Scheduled notification for ${event.title} at ${triggerDate.toLocaleTimeString()}`);
            return id;
        } catch (e) {
            console.error("Error scheduling notification:", e);
        }
    },

    // 3. Cancel Reminder
    cancelReminder: async (notificationId: string) => {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    },
};
