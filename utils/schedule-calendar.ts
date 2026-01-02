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
};

/**
 * Generates a timezone-safe date key (YYYY-MM-DD) for a given Date object.
 * Uses UTC components to ensure consistency with parsed keys.
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
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
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
  // Mapping 0-6 to schema keys?
  // Schema keys are likely "0", "1"... or "sun", "mon".
  // Let's assume schema uses "0" (Sun) to "6" (Sat) string keys based on typical convention if not specified.
  // If undefined, check standard lowercase 3-letter.
  // Actually, I should standardize this.
  // Let's check keys in weekdayDefaults if they exist.
  // For safety, I'll try both numeric string and 3-letter code.
  const dayCodes = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayKeyNum = String(dayOfWeek);
  const dayKeyStr = dayCodes[dayOfWeek];

  const base: OpsSchemaCalendarAssignment | undefined =
    calendar.weekdayDefaults?.[dayKeyNum] ||
    calendar.weekdayDefaults?.[dayKeyStr];

  const result: EffectiveAssignment = {
    status: base?.status || "open", // Default to open if no default? Or closed? Usually open if undefined is risky.
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
    // Sort overrides? They are an array. Assuming order matters or last wins?
    // Usually overrides are cumulative or last wins.
    // Let's process them in order.
    overrides.forEach((ov) => {
      if (ov.kind === "LOCKED") {
        result.isLocked = true;
        result.overrideReasons.push(ov.reason || "Locked");
      } else if (ov.kind === "CLOSED") {
        result.status = "closed";
        result.overrideReasons.push(ov.reason || "Closed");
      } else if (ov.kind === "CLOSE_EARLY") {
        // Handle partial close logic if we supported it in EffectiveAssignment
        // For now, treat as open but maybe add a note?
        result.overrideReasons.push(ov.reason || "Early Close");
      } else if (ov.kind === "PROFILE_SWAP") {
        if (ov.profile_id) {
          result.effectiveProfileId = ov.profile_id;
          result.source = "override";
          result.overrideReasons.push(ov.reason || "Profile Swap");
        }
      } else if (ov.profile_id) {
        // Fallback for generic overrides with profile_id
        result.effectiveProfileId = ov.profile_id;
        result.source = "override";
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
