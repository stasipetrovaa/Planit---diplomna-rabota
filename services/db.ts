import * as SQLite from "expo-sqlite";
import { EventType } from "@/types/types";
import { Platform } from "react-native";

const dbName = "planit.db";

// Helper to open the database
const getDB = async () => {
    if (Platform.OS === "web") {
        return {
            execAsync: async () => { },
            getAllAsync: async () => [],
            runAsync: async () => { },
        };
    }
    return await SQLite.openDatabaseAsync(dbName);
};

export const initDatabase = async () => {
    if (Platform.OS === "web") return;
    try {
        const db = await getDB();
        await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        repeat TEXT,
        notes TEXT,
        color TEXT,
        completed INTEGER DEFAULT 0
      );
    `);
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

export const getEvents = async (): Promise<EventType[]> => {
    if (Platform.OS === "web") return [];
    try {
        const db = await getDB();
        const allRows = await db.getAllAsync("SELECT * FROM events");

        return allRows.map((row: any) => ({
            id: row.id,
            title: row.title,
            startDate: new Date(row.startDate),
            endDate: new Date(row.endDate),
            startTime: new Date(row.startTime),
            endTime: new Date(row.endTime),
            repeat: row.repeat,
            notes: row.notes,
            color: row.color,
            completed: !!row.completed,
            alarms: [],
        }));
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
};

export const addEvent = async (event: EventType) => {
    if (Platform.OS === "web") return;
    try {
        const db = await getDB();
        await db.runAsync(
            `INSERT INTO events (id, title, startDate, endDate, startTime, endTime, repeat, notes, color, completed) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                event.id || Math.random().toString(36).substr(2, 9),
                event.title,
                event.startDate.toISOString(),
                event.endDate.toISOString(),
                event.startTime.toISOString(),
                event.endTime.toISOString(),
                event.repeat || null,
                event.notes || "",
                event.color || "",
                event.completed ? 1 : 0,
            ]
        );
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
};

export const updateEvent = async (event: EventType) => {
    if (Platform.OS === "web") return;
    try {
        const db = await getDB();
        await db.runAsync(
            `UPDATE events SET 
        title = ?, 
        startDate = ?, 
        endDate = ?, 
        startTime = ?, 
        endTime = ?, 
        repeat = ?, 
        notes = ?, 
        color = ?, 
        completed = ? 
       WHERE id = ?`,
            [
                event.title,
                event.startDate.toISOString(),
                event.endDate.toISOString(),
                event.startTime.toISOString(),
                event.endTime.toISOString(),
                event.repeat || null,
                event.notes || "",
                event.color || "",
                event.completed ? 1 : 0,
                event.id || "",
            ]
        );
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
};

export const deleteEvent = async (id: string) => {
    if (Platform.OS === "web") return;
    try {
        const db = await getDB();
        await db.runAsync("DELETE FROM events WHERE id = ?", [id]);
    } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
    }
};
