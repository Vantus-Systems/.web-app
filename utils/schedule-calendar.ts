import type {
  OpsSchemaV2,
  OpsSchemaCalendarAssignment,
  OpsSchemaCalendarOverride,
} from "~/types/ops-schema";

export type EffectiveAssignment = {
  status: "open" | "closed";
  effectiveProfileId: string | null;
  source: "weekday_default" | "assignment" | "override" | "none";
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
 * 1. Weekday Defaults
 * 2. Specific Assignments (Day-level)
 * 3. Overrides (highest priority)
 */
export const resolveEffectiveAssignment = (
  calendar: OpsSchemaV2["calendar"],
  dateStr: string,
): EffectiveAssignment => {
  const dateObj = parseDateKey(dateStr);
  const dayOfWeek = dateObj.getUTCDay(); // 0=Sun, 1=Mon...

  // 1. Weekday Default
  // Normalize to 3-letter code for schema lookup
  const dayCodes = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Match schema convention usually
  // Schema types say Record<string, ...>.
  // Let's assume standard 3-letter title case based on OpsSchemaCompiler usage ("Mon", "Tue"...)
  const dayKeyStr = dayCodes[dayOfWeek] ?? "Sun";

  const base: OpsSchemaCalendarAssignment | undefined =
    calendar.weekdayDefaults?.[dayKeyStr];

  const result: EffectiveAssignment = {
    status: base?.status || "open",
    effectiveProfileId: base?.profile_id || null,
    source: base ? "weekday_default" : "none",
    isLocked: false,
    overrideReasons: [],
  };

  // 2. Specific Assignment
  const assignment = calendar.assignments?.[dateStr];
  if (assignment) {
    result.status = assignment.status;
    if (assignment.profile_id) {
      result.effectiveProfileId = assignment.profile_id;
    }
    result.source = "assignment";
  }

  // 3. Overrides
  const overrides = calendar.overrides?.[dateStr] || [];
  if (overrides.length > 0) {
    overrides.forEach((ov) => {
      // Prioritize kinds
      const kind = ov.kind || (ov.profile_id ? "PROFILE_SWAP" : null);

      if (kind === "LOCKED") {
        result.isLocked = true;
        result.overrideReasons.push(ov.reason || "Locked");
      } else if (kind === "CLOSED") {
        result.status = "closed";
        result.overrideReasons.push(ov.reason || "Closed");
      } else if (kind === "CLOSE_EARLY") {
        result.closeEarlyTime = ov.untilTime;
        result.overrideReasons.push(
          ov.reason || `Close Early at ${ov.untilTime}`,
        );
      } else if (kind === "DOORS_OPEN") {
        result.doorsOpenTime = ov.doors_open_time;
        result.overrideReasons.push(
          ov.reason || `Doors Open at ${ov.doors_open_time}`,
        );
      } else if (kind === "PROFILE_SWAP") {
        if (ov.profile_id) {
          result.effectiveProfileId = ov.profile_id;
          result.source = "override";
          result.overrideReasons.push(ov.reason || "Profile Swap");
        }
      }
    });
  }

  return result;
};

/**
 * Applies a specific assignment to the calendar.
 */
export const applyAssignment = (
  calendar: OpsSchemaV2["calendar"],
  date: string,
  assignment: OpsSchemaCalendarAssignment,
) => {
  if (!calendar.assignments) calendar.assignments = {};
  // If assignment matches default, maybe remove it to save space?
  // For now, explicit write.
  calendar.assignments[date] = { ...assignment };
};

/**
 * Clears assignment for a date.
 */
export const clearAssignment = (
  calendar: OpsSchemaV2["calendar"],
  date: string,
) => {
  if (calendar.assignments && calendar.assignments[date]) {
    delete calendar.assignments[date];
  }
};

/**
 * Applies an override.
 */
export const applyOverride = (
  calendar: OpsSchemaV2["calendar"],
  date: string,
  override: OpsSchemaCalendarOverride,
) => {
  if (!calendar.overrides) calendar.overrides = {};
  if (!calendar.overrides[date]) calendar.overrides[date] = [];

  // If replacing same ID?
  const idx = calendar.overrides[date].findIndex((o) => o.id === override.id);
  if (idx >= 0) {
    calendar.overrides[date][idx] = override;
  } else {
    calendar.overrides[date].push(override);
  }
};

/**
 * Removes an override.
 */
export const removeOverride = (
  calendar: OpsSchemaV2["calendar"],
  date: string,
  overrideId: string,
) => {
  if (!calendar.overrides || !calendar.overrides[date]) return;
  calendar.overrides[date] = calendar.overrides[date].filter(
    (o) => o.id !== overrideId,
  );
  if (calendar.overrides[date].length === 0) {
    delete calendar.overrides[date];
  }
};
