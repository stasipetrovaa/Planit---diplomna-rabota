import { EventType } from "@/types/types";

export const NotificationService = {
    registerForPushNotificationsAsync: async () => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission !== "granted") {
                await Notification.requestPermission();
            }
        }
    },

    scheduleReminder: async (event: EventType) => {
        const start = new Date(event.startDate);
        start.setHours(event.startTime.getHours(), event.startTime.getMinutes(), 0, 0);

        const now = Date.now();
        let triggerTime = start.getTime() - (15 * 60 * 1000); // Default: 15 mins before
        let body = `"${event.title}" starts in 15 minutes!`;

        // Adaptive Logic:
        if (triggerTime <= now) {
            // If 15 mins before is already past, try to remind at the start
            triggerTime = start.getTime();
            body = `"${event.title}" is starting now! 🔔`;
        }

        const delay = triggerTime - now;

        // If even the start time is past or very close, fire almost immediately
        const finalDelay = delay > 0 ? delay : 5000; // 5 second fallback

        console.log(`Web: Scheduling reminder for "${event.title}" at ${new Date(triggerTime).toLocaleTimeString()} (in ${finalDelay / 1000}s)`);

        setTimeout(() => {
            console.log(`Web: Triggering notification for "${event.title}"`);
            if (Notification.permission === "granted") {
                new Notification("PlanIt Reminder 🔔", { body });
            }
        }, finalDelay);
    },

    scheduleCustomReminder: async (event: EventType, triggerDate: Date, message: string) => {
        const now = Date.now();
        const delay = triggerDate.getTime() - now;

        // Adaptive: If time passed or very close, fire in 5s
        const finalDelay = delay > 0 ? delay : 5000;

        console.log(`Web: Scheduling custom AI reminder in ${finalDelay / 1000}s`);

        setTimeout(() => {
            console.log(`Web: Triggering AI notification for "${event.title}"`);
            if (Notification.permission === "granted") {
                new Notification("PlanIt AI ⚡", {
                    body: message,
                });
            }
        }, finalDelay);
    },

    cancelReminder: async (id: string) => {
        // Ensuring interface compatibility, though clearing timeouts requires tracking IDs.
        // For this MVP/Demo, we won't track timeout IDs.
        console.log("Web: Reminder cancel requested (not implemented for setTimeout)");
    },
};
