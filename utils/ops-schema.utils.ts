import { parseHHMM } from "./time.utils";

export const minutesInDay = 24 * 60;

export type TimeRangeMinutes = {
  start: number;
  end: number;
  spansMidnight: boolean;
};

export const toMinutes = (time: string) => parseHHMM(time);

export const toOperationalMinutes = (
  time: string,
  operationalStart: string,
) => {
  const t = toMinutes(time);
  const start = toMinutes(operationalStart);

  // If time is before start, it must be the next day (e.g. 01:00 when start is 09:00)
  // UNLESS the start is very early (e.g. 00:00).
  // We assume the operational day starts at operationalStart.
  // Any time T < Start is T + 24h.
  if (t < start) {
    return t + minutesInDay - start;
  }
  return t - start;
};

export const normalizeTimeRange = (startStr: string, endStr: string) => {
  const start = toMinutes(startStr);
  let end = toMinutes(endStr);
  if (end < start) {
    end += minutesInDay;
  }
  return { start, end, duration: end - start };
};

export const normalizeRangeToOperational = (
  startTime: string,
  endTime: string,
  operationalStart: string,
): { start: number; end: number; duration: number } => {
  const start = toOperationalMinutes(startTime, operationalStart);
  let end = toOperationalMinutes(endTime, operationalStart);

  // If end is before start, it means it wraps to the next "operational day"
  // relative to the start point?
  // No, toOperationalMinutes already maps 00:30 to > 23:00.
  // So if we have 23:00 -> 00:30.
  // start = 840 (if 9am start)
  // end = 930.
  // end > start. Correct.

  // What if 00:30 -> 00:15 (invalid/backwards)?
  // start = 930
  // end = 915
  // end < start.

  // What if 08:00 -> 09:00 (next day wrap).
  // start = 1380
  // end = 0 (09:00 is 0).
  // end < start. We need to add 24h (1440).
  if (end < start) {
    end += minutesInDay;
  }

  return { start, end, duration: end - start };
};

export const detectOverlaps = <
  T extends { time_start: string; time_end: string; allow_overlap?: boolean },
>(
  items: T[],
  operationalStart?: string,
) => {
  const sorted = [...items].sort((a, b) => {
    if (operationalStart) {
      return (
        toOperationalMinutes(a.time_start, operationalStart) -
        toOperationalMinutes(b.time_start, operationalStart)
      );
    }
    return toMinutes(a.time_start) - toMinutes(b.time_start);
  });

  const overlaps: Array<{ a: T; b: T }> = [];
  let last: { item: T; start: number; end: number } | null = null;

  sorted.forEach((item) => {
    let rangeStart: number, rangeEnd: number;

    if (operationalStart) {
      const range = normalizeRangeToOperational(
        item.time_start,
        item.time_end,
        operationalStart,
      );
      rangeStart = range.start;
      rangeEnd = range.end;
    } else {
      const range = normalizeTimeRange(item.time_start, item.time_end);
      rangeStart = range.start;
      rangeEnd = range.end;
    }

    if (
      last &&
      !item.allow_overlap &&
      !last.item.allow_overlap &&
      rangeStart < last.end
    ) {
      overlaps.push({ a: last.item, b: item });
    }

    if (!last || rangeEnd > last.end) {
      last = { item, start: rangeStart, end: rangeEnd };
    }
  });
  return overlaps;
};

export const detectGaps = (
  items: Array<{ time_start: string; time_end: string }>,
  rangeStart: string,
  rangeEnd: string,
  operationalStart?: string,
) => {
  const sorted = [...items].sort((a, b) => {
    if (operationalStart) {
      return (
        toOperationalMinutes(a.time_start, operationalStart) -
        toOperationalMinutes(b.time_start, operationalStart)
      );
    }
    return toMinutes(a.time_start) - toMinutes(b.time_start);
  });

  const gaps: Array<{ start: number; end: number }> = [];

  let rangeS: number, rangeE: number;
  if (operationalStart) {
    const r = normalizeRangeToOperational(
      rangeStart,
      rangeEnd,
      operationalStart,
    );
    rangeS = r.start;
    rangeE = r.end;
  } else {
    const r = normalizeTimeRange(rangeStart, rangeEnd);
    rangeS = r.start;
    rangeE = r.end;
  }

  let cursor = rangeS;

  sorted.forEach((item) => {
    let segS: number, segE: number;
    if (operationalStart) {
      const r = normalizeRangeToOperational(
        item.time_start,
        item.time_end,
        operationalStart,
      );
      segS = r.start;
      segE = r.end;
    } else {
      const r = normalizeTimeRange(item.time_start, item.time_end);
      segS = r.start;
      segE = r.end;
    }

    if (segS > cursor) {
      gaps.push({ start: cursor, end: segS });
    }
    cursor = Math.max(cursor, segE);
  });

  if (cursor < rangeE) {
    gaps.push({ start: cursor, end: rangeE });
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
