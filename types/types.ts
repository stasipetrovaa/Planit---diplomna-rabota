export type Repeat = "none" | "daily" | "weekly" | "monthly" | "yearly";

export type EventType = {
  id?: string;
  title: string;
  startDate: Date;
  endDate: Date;
  repeat: Repeat | null;
  startTime: Date;
  endTime: Date;
  notes?: string;
  color?: string;
  alarms?: any[];
  location?: string;
  completed?: boolean;
};
