// utils/time.utils.ts

/**
 * Parses a time string into minutes from midnight.
 * Accepts "HH:MM" (24h) or "HH:MM AM/PM" (12h).
 */
export const parseTime = (t: string): number => {
  if (!t) return 0;
  const trimmed = t.trim();
  const match12 = trimmed.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    const [_, h, m, ap] = match12;
    let hour = parseInt(h);
    const min = parseInt(m);
    if (ap.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (ap.toUpperCase() === "AM" && hour === 12) hour = 0;
    return hour * 60 + min;
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hour = parseInt(match24[1]);
    const min = parseInt(match24[2]);
    return hour * 60 + min;
  }
  return 0;
};

/**
 * Normalizes day names to 3-letter short code.
 * e.g. "Tuesday" -> "Tue"
 */
export const normalizeDay = (day: string): string => {
  const map: Record<string, string> = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  // Also handle already short names or mis-cased
  const cap = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  if (Object.values(map).includes(cap)) return cap; // Already short
  if (map[cap]) return map[cap];
  return day.substring(0, 3); // Fallback
};
