// utils/time.utils.ts

/**
 * Parses a 12-hour time string (e.g. "10:30 AM", "6:00 PM") into minutes from midnight.
 * Useful for sorting.
 */
export const parseTime = (t: string): number => {
  if (!t) return 0;
  const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let [_, h, m, ap] = match;
  let hour = parseInt(h);
  let min = parseInt(m);
  if (ap.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (ap.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return hour * 60 + min;
};

/**
 * Normalizes day names to 3-letter short code.
 * e.g. "Tuesday" -> "Tue"
 */
export const normalizeDay = (day: string): string => {
    const map: Record<string, string> = {
        "Monday": "Mon",
        "Tuesday": "Tue",
        "Wednesday": "Wed",
        "Thursday": "Thu",
        "Friday": "Fri",
        "Saturday": "Sat",
        "Sunday": "Sun"
    };
    // Also handle already short names or mis-cased
    const cap = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    if (Object.values(map).includes(cap)) return cap; // Already short
    if (map[cap]) return map[cap];
    return day.substring(0, 3); // Fallback
};
