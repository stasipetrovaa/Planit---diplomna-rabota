import { EventType, Repeat } from "@/types/types";
import * as ExpoCalendar from "expo-calendar";
import { RecurrenceRule } from "expo-calendar";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { CalendarProvider } from "react-native-calendars";
import { NotificationService } from "@/services/notifications";
import * as DB from "@/services/db";
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

  // Placeholder for notification logic
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     // MockNotifications.checkNotifications(events);
  //   }, 30000); 
  //   return () => clearInterval(intervalId);
  // }, [events]);


  const { user } = useAuth(); // Get authenticated user

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

      // Let's stick to the current implementation which seems to be utilizing ExpoCalendar for Native.
      // To isolate users on Native (System Calendar), we usually tag events.
      // However, db.native.ts HAS `getEvents` and `addEvent` which use SQLite.
      // AND db.web.ts uses AsyncStorage.

      // CRITICAL: `CalendarContext` lines 98-133 use `ExpoCalendar` for Native, but `webEventsRef` for Web.
      // This means Native uses System Calendar, Web uses custom DB.
      // System Calendar is SHARED on the device.
      // User request: "when I login from 2 different profiles, I see same data".
      // Solution: We need to filter ExpoCalendar events by some metadata linked to the user.

      // STRATEGY update: 
      // 1. Web is already using `db.web.ts` which I updated to filter by `userId`. 
      //    So Web isolation is essentially FIXED by my previous `db.web.ts` change, IF I call it here.
      //    CURRENTLY: Line 99 `setEvents([...webEventsRef.current])` - this is just in-memory.
      //    I need to change Web logic here to call `DB.getEvents(user.id)`.

      // 2. Native uses `ExpoCalendar`. To isolate, we can verify if `event.notes` contains `[user:ID]`.
      //    Or better: Filter the results from `ExpoCalendar.getEventsAsync` based on `notes` containing the user ID.

      const calEvents = await ExpoCalendar.getEventsAsync(
        [calendar.id],
        startDate || new Date(2000, 0, 1),
        endDate || new Date(2100, 11, 31)
      );

      const mappedEvents =
        calEvents
          .map((event) => {
            // ... mapping logic
            const { color, cleanedNotes } = extractColorAndNotes(event.notes);
            // check ownership
            if (!event.notes?.includes(`[uid:${user.id}]`)) {
              // Only filter if we enact strict ownership. 
              // For now, let's just create events WITH the tag.
            }
            // ...
          })

      // REVISION: The User wants isolation. 
      // If I modify `addEvent` to append `[uid:USER_ID]` to notes, 
      // then in `getEvents`, I filter by that tag.

      return []; // Placeholder for the actual replacement block below
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
      // Check if our calendar already exists
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

      // Determine a valid source for the new calendar
      let defaultCalendarSource: any = null;
      if (Platform.OS === "ios") {
        defaultCalendarSource = await getDefaultCalendarSource();
      } else {
        // On Android, we must provide a local account source
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

      // Refetch calendars and set the created one
      const refreshed = await ExpoCalendar.getCalendarsAsync(
        ExpoCalendar.EntityTypes.EVENT
      );
      const createdCalendar = refreshed.find((cal) => cal.id === newCalendarID);
      setCalendar(createdCalendar || refreshed[0] || null);
    } catch (error) {
      console.error("Error creating calendar:", error);
      // Fallback to default calendar if creation fails
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
      return newEvent.id!;
    }

    if (!calendar?.id || !user?.id) {
      console.error("No calendar available or user not logged in");
      return "";
    }

    try {
      const baseNotes = event.notes || "";
      // Construct metadata tag
      let metadata = `[uid:${user.id}]`;
      if (event.color) metadata += `[color:${event.color}]`;

      const notesToSave = `${baseNotes}${baseNotes ? "\n" : ""}${metadata}`;

      const eventId = await ExpoCalendar.createEventAsync(calendar.id, {
        title: event.title,
        startDate: startDateTime,
        endDate: endDateTime,
        notes: notesToSave,
        recurrenceRule:
          event.repeat && event.repeat !== "none"
            ? ({
              frequency: event.repeat,
            } as RecurrenceRule)
            : undefined,
        alarms: event.alarms || [],
      });

      // INTELLIGENT AGENT: Schedule a local reminder
      await NotificationService.scheduleReminder({
        ...event,
        id: eventId, // Use the real ID
        startDate: startDateTime,
        startTime: startDateTime,
      });

      await getEvents();
      return eventId;
    } catch (error) {
      console.error("Error creating event:", error);
      return "";
    }
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
      webEventsRef.current = webEventsRef.current.map((e) =>
        e.id === event.id ? updatedEvent : e
      );
      setEvents([...webEventsRef.current]);
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
            ? ({ frequency: event.repeat } as RecurrenceRule)
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
