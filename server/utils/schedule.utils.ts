export interface Slot {
  day_of_week: number;
  start_time: string; // HH:MM
  duration_minutes: number;
}

export const hasOverlaps = (slots: Slot[]) => {
  const byDay: Record<number, Slot[]> = {};
  for (const slot of slots) {
    if (!byDay[slot.day_of_week]) byDay[slot.day_of_week] = [];
    byDay[slot.day_of_week].push(slot);
  }

  for (const day in byDay) {
    const daySlots = byDay[Number(day)] || [];
    daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));

    for (let i = 0; i < daySlots.length - 1; i++) {
      const current = daySlots[i]!;
      const next = daySlots[i + 1]!;

      const currentStart = parseTime(current.start_time);
      const currentEnd = currentStart + current.duration_minutes;
      const nextStart = parseTime(next.start_time);

      if (currentEnd > nextStart) {
        return true;
      }
    }
  }
  return false;
};

const parseTime = (time: string) => {
  const parts = time.split(":");
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  return h * 60 + m;
};
