import { EventType, Repeat } from "@/types/types";
import * as ExpoCalendar from "expo-calendar";
import { RecurrenceRule } from "expo-calendar";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { CalendarProvider } from "react-native-calendars";
import { NotificationService } from "@/services/notifications";
import * as DB from "@/services/db";
import { generateSmartReminders } from "@/services/ai";
import { useAuth } from "./auth-context";

type CalendarContextType = {
  today: Date;
  setToday: (date: Date) => void;
  calendar: ExpoCalendar.Calendar | null;
  monthDayString: string;
  todayToString: string;
  addEvent: (event: EventType) => Promise<string>;
  updateEvent: (event: EventType) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  toggleEventComplete: (event: EventType) => Promise<boolean>;
  getEvents: (startDate?: Date, endDate?: Date) => Promise<EventType[]>;
  events: EventType[];
};

const CalendarContext = createContext<CalendarContextType>({
  today: new Date(),
  setToday: () => { },
  calendar: null,
  monthDayString: "",
  todayToString: "",
  addEvent: async () => "",
  updateEvent: async () => false,
  deleteEvent: async () => false,
  toggleEventComplete: async () => false,
  getEvents: async () => [],
  events: [],
});

export const useCalendar = () => useContext(CalendarContext);

export const ExpoCalendarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [today, setToday] = useState(new Date());
  const [calendar, setCalendar] = useState<ExpoCalendar.Calendar | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const webEventsRef = useRef<EventType[]>([]);

  const monthDayString = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const todayToString = today.toISOString().split("T")[0];

  const { user } = useAuth();

  useEffect(() => {
    NotificationService.registerForPushNotificationsAsync();

    if (Platform.OS === "web") {
      if (user?.id) getEvents();
      return;
    }

    (async () => {
      try {
        const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
        if (status === "granted") {
          await createCalendar();
          if (user?.id) await getEvents();
        }
      } catch (error) {
        console.error("Error in calendar setup:", error);
      }
    })();
  }, [user?.id]);

  function extractMetadata(rawNotes?: string): {
    color?: string;
    cleanedNotes: string;
    ownerId?: string;
  } {
    const colorRegex = /\[color:(#[0-9a-fA-F]{6})\]/;
    const uidRegex = /\[uid:([^\]]+)\]/;

    let current = rawNotes || "";

    const colorMatch = current.match(colorRegex);
    const color = colorMatch ? colorMatch[1] : undefined;
    current = current.replace(colorRegex, "");

    const uidMatch = current.match(uidRegex);
    const ownerId = uidMatch ? uidMatch[1] : undefined;
    current = current.replace(uidRegex, "");

    return { color, cleanedNotes: current.trim(), ownerId };
  }

  const getEvents = async (
    startDate?: Date,
    endDate?: Date
  ): Promise<EventType[]> => {
    if (!user?.id) return [];

    if (Platform.OS === "web") {
      const dbEvents = await DB.getEvents(user.id);
      webEventsRef.current = dbEvents;
      setEvents(dbEvents);
      return dbEvents;
    }

    if (!calendar?.id) return [];

    try {
      const calEvents = await ExpoCalendar.getEventsAsync(
        [calendar.id],
        startDate || new Date(2000, 0, 1),
        endDate || new Date(2100, 11, 31)
      );

      return calEvents.map((event) => {
        const { color, cleanedNotes } = extractMetadata(event.notes);
        return {
          id: event.id,
          title: event.title,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          startTime: new Date(event.startDate),
          endTime: new Date(event.endDate),
          color: color,
          notes: cleanedNotes,
          completed: false,
        };
      });
    } catch (err) {
      return [];
    }
  };


  async function getDefaultCalendarSource() {
    const defaultCalendar = await ExpoCalendar.getDefaultCalendarAsync();
    return defaultCalendar.source;
  }

  async function createCalendar() {
    try {
      const calendars = await ExpoCalendar.getCalendarsAsync(
        ExpoCalendar.EntityTypes.EVENT
      );
      const existingCalendar = calendars.find(
        (cal) => cal.title === "PlanIt Calendar"
      );

      if (existingCalendar) {
        setCalendar(existingCalendar);
        return;
      }

      let defaultCalendarSource: any = null;
      if (Platform.OS === "ios") {
        defaultCalendarSource = await getDefaultCalendarSource();
      } else {
        defaultCalendarSource = { isLocalAccount: true, name: "PlanIt" };
      }

      const newCalendarID = await ExpoCalendar.createCalendarAsync({
        title: "PlanIt Calendar",
        color: "blue",
        entityType: ExpoCalendar.EntityTypes.EVENT,
        sourceId: Platform.OS === "ios" ? defaultCalendarSource?.id : undefined,
        source: defaultCalendarSource,
        name: "planit_calendar",
        ownerAccount: "personal",
        accessLevel: ExpoCalendar.CalendarAccessLevel.OWNER,
      });

      const refreshed = await ExpoCalendar.getCalendarsAsync(
        ExpoCalendar.EntityTypes.EVENT
      );
      const createdCalendar = refreshed.find((cal) => cal.id === newCalendarID);
      setCalendar(createdCalendar || refreshed[0] || null);
    } catch (error) {
      console.error("Error creating calendar:", error);
      const calendars = await ExpoCalendar.getCalendarsAsync(
        ExpoCalendar.EntityTypes.EVENT
      );
      setCalendar(calendars[0] || null);
    }
  }

  async function addEvent(event: EventType) {
    const startDateTime = new Date(event.startDate);
    startDateTime.setHours(event.startTime.getHours());
    startDateTime.setMinutes(event.startTime.getMinutes());
    startDateTime.setSeconds(0);
    startDateTime.setMilliseconds(0);

    const endDateTime = new Date(event.startDate);
    endDateTime.setHours(event.endTime.getHours());
    endDateTime.setMinutes(event.endTime.getMinutes());
    endDateTime.setSeconds(0);
    endDateTime.setMilliseconds(0);

    let eventId = "";

    if (Platform.OS === "web") {
      if (!user?.id) return "";
      const newEvent: EventType = {
        ...event,
        id: `web-${Date.now()}`,
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        userId: user.id
      };
      // For web, use DB directly
      await DB.addEvent(newEvent);
      await getEvents();
      eventId = newEvent.id!;
    } else {
      if (!calendar?.id || !user?.id) {
        console.error("No calendar available or user not logged in");
        return "";
      }

      try {
        const baseNotes = event.notes || "";
        const metadata = `[uid:${user.id}]` + (event.color ? `[color:${event.color}]` : "");
        const notesToSave = `${baseNotes}${baseNotes ? "\n" : ""}${metadata}`;

        const createdId = await ExpoCalendar.createEventAsync(calendar.id, {
          title: event.title,
          startDate: startDateTime,
          endDate: endDateTime,
          notes: notesToSave,
          recurrenceRule:
            event.repeat && event.repeat !== "none"
              ? ({
                frequency: event.repeat === "daily" ? ExpoCalendar.Frequency.DAILY :
                  event.repeat === "weekly" ? ExpoCalendar.Frequency.WEEKLY :
                    event.repeat === "monthly" ? ExpoCalendar.Frequency.MONTHLY :
                      event.repeat === "yearly" ? ExpoCalendar.Frequency.YEARLY :
                        ExpoCalendar.Frequency.DAILY,
              } as RecurrenceRule)
              : undefined,
          alarms: event.alarms || [],
        });
        eventId = createdId;
      } catch (error) {
        console.error("Error creating event:", error);
        return "";
      }
    }

    // SHARED: Intelligent Agent Logic (Runs for both Web & Native)
    if (eventId) {
      // 1. Schedule local standard reminder (15 mins before)
      await NotificationService.scheduleReminder({
        ...event,
        id: eventId,
        startDate: startDateTime,
        startTime: startDateTime,
      });

      // 2. Automatic AI Reminders in background
      generateSmartReminders({ ...event, id: eventId }).then(async (aiReminders) => {
        if (aiReminders && aiReminders.length > 0) {
          console.log("AI generated reminders:", aiReminders);
          const updatedEvent = {
            ...event,
            id: eventId,
            startDate: startDateTime,
            startTime: startDateTime,
            endDate: endDateTime,
            endTime: endDateTime,
            alarms: aiReminders,
            notes: (event.notes || "") + `\n✨ AI added ${aiReminders.length} reminders`
          };

          // Persist the AI updates (notes and alarms)
          await updateEvent(updatedEvent);

          // Schedule the new AI alarms
          aiReminders.forEach(async (alarm: any) => {
            const alarmDate = new Date(startDateTime.getTime() + (alarm.relativeOffset * 60 * 1000));

            await NotificationService.scheduleCustomReminder(
              updatedEvent,
              alarmDate,
              `AI Suggestion: ${updatedEvent.title}`
            );
          });
        }
      });
    }

    if (Platform.OS !== "web") {
      await getEvents();
    }

    return eventId;
  }

  async function updateEvent(event: EventType): Promise<boolean> {
    if (!event.id) return false;

    const startDateTime = new Date(event.startDate);
    startDateTime.setHours(event.startTime.getHours());
    startDateTime.setMinutes(event.startTime.getMinutes());
    startDateTime.setSeconds(0);
    startDateTime.setMilliseconds(0);

    const endDateTime = new Date(event.startDate);
    endDateTime.setHours(event.endTime.getHours());
    endDateTime.setMinutes(event.endTime.getMinutes());
    endDateTime.setSeconds(0);
    endDateTime.setMilliseconds(0);

    if (Platform.OS === "web") {
      const updatedEvent: EventType = {
        ...event,
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
      };

      const newWebEvents = webEventsRef.current.map((e) =>
        e.id === event.id ? updatedEvent : e
      );
      webEventsRef.current = newWebEvents;
      setEvents(newWebEvents);
      return true;
    }

    if (!calendar?.id) return false;

    try {
      const baseNotes = event.notes || "";
      const hasTag = /\[color:(#[0-9a-fA-F]{6})\]/.test(baseNotes);
      const notesToSave = event.color
        ? hasTag
          ? baseNotes
          : `${baseNotes}${baseNotes ? "\n" : ""}[color:${event.color}]`
        : baseNotes;

      await ExpoCalendar.updateEventAsync(event.id, {
        title: event.title,
        startDate: startDateTime,
        endDate: endDateTime,
        notes: notesToSave,
        recurrenceRule:
          event.repeat && event.repeat !== "none"
            ? ({
              frequency: event.repeat === "daily" ? ExpoCalendar.Frequency.DAILY :
                event.repeat === "weekly" ? ExpoCalendar.Frequency.WEEKLY :
                  event.repeat === "monthly" ? ExpoCalendar.Frequency.MONTHLY :
                    event.repeat === "yearly" ? ExpoCalendar.Frequency.YEARLY :
                      ExpoCalendar.Frequency.DAILY,
            } as RecurrenceRule)
            : undefined,
        alarms: event.alarms || [],
      });

      await getEvents();
      return true;
    } catch (error) {
      console.error("Error updating event:", error);
      return false;
    }
  }

  async function deleteEvent(eventId: string): Promise<boolean> {
    if (Platform.OS === "web") {
      webEventsRef.current = webEventsRef.current.filter((e) => e.id !== eventId);
      setEvents([...webEventsRef.current]);
      return true;
    }

    if (!calendar?.id) return false;

    try {
      await ExpoCalendar.deleteEventAsync(eventId);
      await getEvents();
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  async function toggleEventComplete(event: EventType): Promise<boolean> {
    const updatedEvent = { ...event, completed: !event.completed };
    return updateEvent(updatedEvent);
  }

  return (
    <CalendarContext.Provider
      value={{
        today,
        setToday,
        calendar,
        monthDayString,
        todayToString,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleEventComplete,
        getEvents,
        events,
      }}
    >
      <CalendarProvider date={todayToString}>{children}</CalendarProvider>
    </CalendarContext.Provider>
  );
};
