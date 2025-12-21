import { EventType } from "@/types/types";

export const NotificationService = {
    registerForPushNotificationsAsync: async () => {
        console.log("Web: Notifications not supported");
    },
    scheduleReminder: async (event: EventType) => {
        console.log("Web: Reminder scheduled (mock)", event.title);
    },
    cancelReminder: async (id: string) => {
        console.log("Web: Reminder cancelled", id);
    },
};
