import { EventType } from "@/types/types";

// API key (Move this to .env file as EXPO_PUBLIC_GEMINI_API_KEY)
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

export const generateSmartReminders = async (event: EventType): Promise<any[]> => {


    const now = new Date();
    const prompt = `
    Current Time: "${now.toLocaleTimeString()}"
    I have a calendar event:
    Title: "${event.title}"
    Notes: "${event.notes || ""}"
    Start Time: "${event.startTime.toLocaleTimeString()}"
    Date: "${event.startDate.toDateString()}"

    Suggest 2 helpful reminder times for this event.
    - If the event is starting in less than 15 minutes, suggest 0 (at start time).
    - Otherwise, suggest times like 15 minutes before, or 1 hour before.
    
    Return ONLY a JSON array of numbers representing minutes before the event to remind.
    Example: [0, 15]
  `;

    try {
        console.log("Sending request to Gemini...");
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", response.status, errorText);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log("Gemini Response:", text);

        if (!text) return [];

        // Parse JSON from text (sometimes Gemini wraps in markdown code blocks)
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
            const minutesArray = JSON.parse(jsonMatch[0]);
            return minutesArray.map((m: number) => ({
                relativeOffset: -m, // Negative for "before"
                method: "alert"
            }));
        }
        return [];
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Rethrow so the UI knows it failed with a specific reason if needed
        return [];
    }
};
