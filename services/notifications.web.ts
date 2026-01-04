import { EventType } from "@/types/types";

export const NotificationService = {
    registerForPushNotificationsAsync: async () => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission !== "granted") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    console.log("Web: Notification permission denied");
                }
            }
        }
    },

    scheduleReminder: async (event: EventType) => {
        // Basic reminder execution
        const triggerDate = new Date(event.startDate);
        triggerDate.setHours(event.startTime.getHours());
        triggerDate.setMinutes(event.startTime.getMinutes());
        triggerDate.setMinutes(triggerDate.getMinutes() - 15); // Default 15 min rule

        const now = Date.now();
        const delay = triggerDate.getTime() - now;

        if (delay > 0) {
            console.log(`Web: Scheduling standard reminder in ${delay / 1000}s`);
            setTimeout(() => {
                new Notification("Upcoming Task 🔔", {
                    body: `"${event.title}" starts in 15 minutes!`,
                });
            }, delay);
        }
    },

    scheduleCustomReminder: async (event: EventType, triggerDate: Date, message: string) => {
        const now = Date.now();
        const delay = triggerDate.getTime() - now;

        if (delay > 0) {
            console.log(`Web: Scheduling custom AI reminder in ${delay / 1000}s`);
            setTimeout(() => {
                if (Notification.permission === "granted") {
                    new Notification("PlanIt AI ⚡", {
                        body: message,
                    });
                } else {
                    alert(`PlanIt Reminder:\n${message}`);
                }
            }, delay);
        } else {
            console.warn("Web: Trigger date is in the past", triggerDate);
        }
    },

    cancelReminder: async (id: string) => {
        // Ensuring interface compatibility, though clearing timeouts requires tracking IDs.
        // For this MVP/Demo, we won't track timeout IDs.
        console.log("Web: Reminder cancel requested (not implemented for setTimeout)");
    },
};
