import { EventType, Repeat } from "@/types/types";
import * as ExpoCalendar from "expo-calendar";
import { RecurrenceRule } from "expo-calendar";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { CalendarProvider } from "react-native-calendars";

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
  setToday: () => {},
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

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    (async () => {
      try {
        const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
        if (status === "granted") {
          await createCalendar();
          await getEvents();
        }
      } catch (error) {
        console.error("Error in calendar setup:", error);
      }
    })();
  }, []);

  function extractColorAndNotes(rawNotes?: string): {
    color?: string;
    cleanedNotes: string;
  } {
    const colorRegex = /\[color:(#[0-9a-fA-F]{6})\]/;
    const original = rawNotes || "";
    const match = original.match(colorRegex);
    const color = match ? match[1] : undefined;
    const cleanedNotes = original.replace(colorRegex, "").trim();
    return { color, cleanedNotes };
  }

  const getEvents = async (
    startDate?: Date,
    endDate?: Date
  ): Promise<EventType[]> => {
    if (Platform.OS === "web") {
      setEvents([...webEventsRef.current]);
      return webEventsRef.current;
    }

    if (!calendar?.id) return [];

    try {
      const calEvents = await ExpoCalendar.getEventsAsync(
        [calendar.id],
        startDate || new Date(2000, 0, 1),
        endDate || new Date(2100, 11, 31)
      );

      const mappedEvents =
        calEvents.map((event) => {
          const { color, cleanedNotes } = extractColorAndNotes(event.notes);
          return {
            id: event.id,
            title: event.title,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            repeat: event.recurrenceRule?.frequency as Repeat | null,
            startTime: new Date(event.startDate),
            endTime: new Date(event.endDate),
            notes: cleanedNotes,
            color,
            alarms: event.alarms ?? [],
          };
        }) || [];
      setEvents(mappedEvents);
      return mappedEvents;
    } catch (err) {
      console.error("Error fetching events:", err);
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
      const newEvent: EventType = {
        ...event,
        id: `web-${Date.now()}`,
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
      };
      console.log("Web: Adding new event:", newEvent);
      webEventsRef.current = [...webEventsRef.current, newEvent];
      console.log("Web: All events now:", webEventsRef.current);
      setEvents([...webEventsRef.current]);
      return newEvent.id!;
    }

    if (!calendar?.id) {
      console.error("No calendar available");
      return "";
    }

    try {
      const baseNotes = event.notes || "";
      const hasTag = /\[color:(#[0-9a-fA-F]{6})\]/.test(baseNotes);
      const notesToSave = event.color
        ? hasTag
          ? baseNotes
          : `${baseNotes}${baseNotes ? "\n" : ""}[color:${event.color}]`
        : baseNotes;

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
