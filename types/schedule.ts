export interface WeeklyScheduleSlot {
  id?: string;
  day_of_week: number; // 0-6
  start_time: string; // HH:MM
  duration_minutes: number;
  program_slug: string;
  overrides?: Record<string, any> | null;
}

export interface ScheduleVersion {
  id: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  created_at: string;
  created_by: string;
  published_at?: string;
  published_by?: string;
  week_start?: string;
  slots: WeeklyScheduleSlot[];
}

export interface CalendarOverride {
  date: string; // YYYY-MM-DD
  kind: "LOCKED" | "CLOSED" | "CLOSE_EARLY" | "DOORS_OPEN";
  reason?: string;
  note?: string;
  doorsOpenTime?: string; // HH:mm
}

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
