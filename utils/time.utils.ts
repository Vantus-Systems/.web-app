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
    const h = match12[1]!;
    const m = match12[2]!;
    const ap = match12[3]!;
    let hour = parseInt(h, 10);
    const min = parseInt(m, 10);
    const period = ap.toUpperCase();
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + min;
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hour = parseInt(match24[1]!, 10);
    const min = parseInt(match24[2]!, 10);
    return hour * 60 + min;
  }
  return 0;
};

/**
 * Parses a strict 24h time string "HH:MM" into minutes from midnight.
 */
export const parseHHMM = (t: string): number => {
  if (!t) return 0;
  const match = t.trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
  return hours * 60 + minutes;
};

/**
 * Formats a 24h time string "HH:MM" into a 12h display string.
 * e.g. "22:30" -> "10:30 PM"
 */
export const formatHHMM = (t: string): string => {
  const match = t.trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return t;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return t;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return t;
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
};

/**
 * Formats minutes from midnight into 12h time string.
 * e.g. 1350 -> "10:30 PM"
 */
export const formatTime = (totalMinutes: number): string => {
  let m = Math.floor(totalMinutes);
  if (m < 0) m += 24 * 60; // handle wrap around negative
  m = m % (24 * 60);

  let hours = Math.floor(m / 60);
  const minutes = m % 60;

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
};
