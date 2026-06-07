import * as SQLite from "expo-sqlite";
import { EventType, UserType } from "@/types/types";
import { Platform } from "react-native";

const dbName = "planit.db";

// Helper to open the database
const getDB = async () => {
    return await SQLite.openDatabaseAsync(dbName);
};

export const initDatabase = async () => {
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
        completed INTEGER DEFAULT 0,
        userId TEXT
      );
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        avatarUri TEXT
      );
    `);
        // Migration to add avatarUri to existing users table
        try {
            await db.execAsync("ALTER TABLE users ADD COLUMN avatarUri TEXT;");
            console.log("Migration: added avatarUri column to users table");
        } catch (e) {
            // Already exists or error, ignore
        }
        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

export const getEvents = async (userId: string): Promise<EventType[]> => {
    try {
        const db = await getDB();
        // Fallback for older rows without userId (assign them to first user or keep legacy behavior?
        // Ideally should filter by userId.
        const allRows = await db.getAllAsync("SELECT * FROM events WHERE userId = ?", [userId]);

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
            userId: row.userId
        }));
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
};

export const addEvent = async (event: EventType) => {
    try {
        const db = await getDB();
        await db.runAsync(
            `INSERT INTO events (id, title, startDate, endDate, startTime, endTime, repeat, notes, color, completed, userId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                event.userId || null
            ]
        );
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
};

export const updateEvent = async (event: EventType) => {
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
    try {
        const db = await getDB();
        await db.runAsync("DELETE FROM events WHERE id = ?", [id]);
    } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
    }
};

// Auth Methods
export const registerUser = async (user: UserType) => {
    try {
        const db = await getDB();
        await db.runAsync(
            "INSERT INTO users (id, email, password, name, avatarUri) VALUES (?, ?, ?, ?, ?)",
            [user.id, user.email, user.password ?? null, user.name ?? null, user.avatarUri ?? null]
        );
        return user;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
};

export const loginUser = async (email: string, password: string): Promise<UserType | null> => {
    try {
        const db = await getDB();
        const result = await db.getAllAsync(
            "SELECT * FROM users WHERE email = ? AND password = ?",
            [email, password]
        );
        if (result.length > 0) {
            return result[0] as UserType;
        }
        return null;
    } catch (error) {
        console.error("Error logging in:", error);
        return null;
    }
};

export const updateUserProfile = async (userId: string, name: string, avatarUri: string | null) => {
    try {
        const db = await getDB();
        await db.runAsync(
            "UPDATE users SET name = ?, avatarUri = ? WHERE id = ?",
            [name, avatarUri, userId]
        );
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

export const deleteUser = async (userId: string) => {
    try {
        const db = await getDB();
        await db.runAsync("DELETE FROM events WHERE userId = ?", [userId]);
        await db.runAsync("DELETE FROM users WHERE id = ?", [userId]);
    } catch (error) {
        console.error("Error deleting user account:", error);
        throw error;
    }
};
