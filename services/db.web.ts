import { EventType, UserType } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys for persistence
const USERS_KEY = "planit_web_users";
const EVENTS_KEY = "planit_web_events";

// Helper to load data
const loadData = async <T>(key: string): Promise<T[]> => {
    try {
        const json = await AsyncStorage.getItem(key);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.error(`Error loading ${key}`, e);
        return [];
    }
};

// Helper to save data
const saveData = async <T>(key: string, data: T[]) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving ${key}`, e);
    }
};

export const initDatabase = async () => {
    console.log("Web Database (Persistent) initialized");
};

export const getEvents = async (): Promise<EventType[]> => {
    const events = await loadData<EventType>(EVENTS_KEY);
    // Convert date strings back to Date objects
    return events.map(e => ({
        ...e,
        startDate: new Date(e.startDate),
        endDate: new Date(e.endDate),
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime),
    }));
};

export const addEvent = async (event: EventType) => {
    const events = await getEvents();
    events.push(event);
    await saveData(EVENTS_KEY, events);
};

export const updateEvent = async (event: EventType) => {
    const events = await getEvents();
    const index = events.findIndex((e) => e.id === event.id);
    if (index !== -1) {
        events[index] = event;
        await saveData(EVENTS_KEY, events);
    }
};

export const deleteEvent = async (id: string) => {
    let events = await getEvents();
    events = events.filter((e) => e.id !== id);
    await saveData(EVENTS_KEY, events);
};

// Auth Methods
export const registerUser = async (user: UserType) => {
    const users = await loadData<UserType>(USERS_KEY);
    const existing = users.find((u) => u.email === user.email);
    if (existing) return null;

    users.push(user);
    await saveData(USERS_KEY, users);
    return user;
};

export const loginUser = async (email: string, password: string): Promise<UserType | null> => {
    const users = await loadData<UserType>(USERS_KEY);
    const user = users.find((u) => u.email === email && u.password === password);
    return user || null;
};
