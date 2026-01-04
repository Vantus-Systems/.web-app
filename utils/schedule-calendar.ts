import type { WeeklyScheduleSlot, CalendarOverride } from "~/types/schedule";

export type EffectiveAssignment = {
  status: "open" | "closed";
  programSlug: string | null;
  source: "weekday_default" | "override" | "none";
  isLocked: boolean;
  overrideReasons: string[];
  doorsOpenTime?: string;
  closeEarlyTime?: string;
};

/**
 * Generates a timezone-safe date key (YYYY-MM-DD) for a given Date object.
 * Uses UTC components to ensure consistency with parsed keys.
 * WARNING: Ensure the input Date is set to UTC midnight if you intend to represent a calendar date,
 * or understand that this will extract the UTC date component.
 */
export const dateKey = (date: Date): string => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Parses a YYYY-MM-DD string into a Date object (UTC midnight).
 */
export const parseDateKey = (key: string): Date => {
  const parts = key.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(Date.UTC(y, m - 1, d));
};

/**
 * Adds days to a date string safely in UTC.
 */
export const addDays = (dateStr: string, days: number): string => {
  const date = parseDateKey(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKey(date);
};

/**
 * Resolves the effective assignment for a given date by layering:
 * 1. Weekday Defaults (from ScheduleSlots)
 * 2. Overrides (highest priority)
 */
export const resolveEffectiveAssignment = (
  dateStr: string,
  slots: WeeklyScheduleSlot[],
  overridesMap: Record<string, CalendarOverride[]>,
): EffectiveAssignment => {
  const dateObj = parseDateKey(dateStr);
  const dayOfWeek = dateObj.getUTCDay(); // 0=Sun, 1=Mon...

  // 1. Weekday Default
  const slot = slots.find((s) => s.day_of_week === dayOfWeek);

  const result: EffectiveAssignment = {
    status: slot ? "open" : "closed",
    programSlug: slot ? slot.program_slug : null,
    source: slot ? "weekday_default" : "none",
    isLocked: false,
    overrideReasons: [],
  };

  // 2. Overrides
  const overrides = overridesMap[dateStr] || [];
  if (overrides.length > 0) {
    overrides.forEach((ov) => {
      // Prioritize kinds
      const kind = ov.kind;

      if (kind === "LOCKED") {
        result.isLocked = true;
        result.overrideReasons.push(ov.reason || "Locked");
      } else if (kind === "CLOSED") {
        result.status = "closed";
        result.overrideReasons.push(ov.reason || "Closed");
      } else if (kind === "CLOSE_EARLY") {
        // result.closeEarlyTime = ov.untilTime; // Legacy had untilTime, new type doesn't support it yet unless I add it
        result.overrideReasons.push(ov.reason || "Close Early");
      } else if (kind === "DOORS_OPEN") {
        result.doorsOpenTime = ov.doorsOpenTime;
        result.overrideReasons.push(
          ov.reason || `Doors Open at ${ov.doorsOpenTime}`,
        );
      }
    });

    // If any override exists, mark source as override?
    // Or only if it changes the core assignment?
    // For now, let's say if we have overrides, source is effectively influenced by them.
    // But "source" usually meant "where did the profile come from".
    // If just doors open changed, profile is still from default.
    // If CLOSED, status changed.
  }

  return result;
};
