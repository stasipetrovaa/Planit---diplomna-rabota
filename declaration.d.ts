declare module "*.svg" {
  import * as React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "@/services/db" {
  export const initDatabase: () => Promise<void>;
  export const getEvents: (userId: string) => Promise<any[]>;
  export const addEvent: (event: any) => Promise<void>;
  export const updateEvent: (event: any) => Promise<void>;
  export const deleteEvent: (id: string) => Promise<void>;
  export const loginUser: (email: string, password: string) => Promise<any>;
  export const registerUser: (user: any) => Promise<any>;
}

declare module "@/services/notifications" {
  export const NotificationService: {
    registerForPushNotificationsAsync: () => Promise<void>;
    scheduleReminder: (event: any) => Promise<string | undefined>;
    scheduleCustomReminder: (event: any, triggerDate: Date, message: string) => Promise<string | undefined>;
    cancelReminder: (identifier: string) => Promise<void>;
  };
}
