import { parseHHMM } from "~/utils/time.utils";

export const minutesInDay = 24 * 60;

export type TimeRangeMinutes = {
  start: number;
  end: number;
  spansMidnight: boolean;
};

export const toMinutes = (time: string) => parseHHMM(time);

export const normalizeTimeRange = (
  startTime: string,
  endTime: string,
): TimeRangeMinutes => {
  const start = toMinutes(startTime);
  let end = toMinutes(endTime);
  const spansMidnight = end <= start;
  if (spansMidnight) {
    end += minutesInDay;
  }
  return { start, end, spansMidnight };
};

export const snapMinutes = (value: number, increment: number) => {
  if (increment <= 0) return value;
  return Math.round(value / increment) * increment;
};

export const detectOverlaps = <
  T extends { time_start: string; time_end: string; allow_overlap?: boolean },
>(
  items: T[],
) => {
  const sorted = [...items].sort(
    (a, b) => toMinutes(a.time_start) - toMinutes(b.time_start),
  );
  const overlaps: Array<{ a: T; b: T }> = [];
  let last: { item: T; range: TimeRangeMinutes } | null = null;
  sorted.forEach((item) => {
    const range = normalizeTimeRange(item.time_start, item.time_end);
    if (
      last &&
      !item.allow_overlap &&
      !last.item.allow_overlap &&
      range.start < last.range.end
    ) {
      overlaps.push({ a: last.item, b: item });
    }
    if (!last || range.end > last.range.end) {
      last = { item, range };
    }
  });
  return overlaps;
};

export const detectGaps = (
  items: Array<{ time_start: string; time_end: string }>,
  rangeStart: string,
  rangeEnd: string,
) => {
  const sorted = [...items].sort(
    (a, b) => toMinutes(a.time_start) - toMinutes(b.time_start),
  );
  const gaps: Array<{ start: number; end: number }> = [];
  const range = normalizeTimeRange(rangeStart, rangeEnd);
  let cursor = range.start;
  sorted.forEach((item) => {
    const segment = normalizeTimeRange(item.time_start, item.time_end);
    if (segment.start > cursor) {
      gaps.push({ start: cursor, end: segment.start });
    }
    cursor = Math.max(cursor, segment.end);
  });
  if (cursor < range.end) {
    gaps.push({ start: cursor, end: range.end });
  }
  return gaps;
};

export const isTimeWithinRange = (
  time: string,
  rangeStart: string,
  rangeEnd: string,
) => {
  const range = normalizeTimeRange(rangeStart, rangeEnd);
  const minutes = toMinutes(time);
  if (minutes >= range.start) return minutes <= range.end;
  return minutes + minutesInDay <= range.end;
};

export const formatMinutes = (minutes: number) => {
  const normalized = ((minutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};
