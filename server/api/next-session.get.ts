import { defineEventHandler } from "h3";
import prisma from "@server/db/client";
import { settingsService } from "@server/services/settings.service";

/**
 * Public: Next Session endpoint
 * - Uses ACTIVE schedule version if present; falls back to legacy `settings.schedule` otherwise.
 * - Returns the nearest upcoming gaming session (never an already-started slot).
 * - Enriches with program name/slug and includes an ISO start timestamp for precise countdowns.
 */
export default defineEventHandler(async () => {
  // Try ACTIVE ScheduleVersion first
  const activeVersion = await prisma.scheduleVersion.findFirst({
    where: { status: "ACTIVE" },
    include: { slots: true },
  });

  // Prefer ACTIVE version slots; fall back to legacy `settings.schedule` but only
  // keep entries that look like real gaming slots (day_of_week/start_time/program_slug)
  const legacy = (await settingsService.get("schedule")) as any[] | null;
  const slotsRaw = activeVersion?.slots?.length ? activeVersion.slots : legacy || [];
  const slots = Array.isArray(slotsRaw)
    ? slotsRaw.filter(
        (s: any) =>
          typeof s?.start_time === "string" &&
          typeof s?.day_of_week === "number" &&
          typeof s?.program_slug === "string",
      )
    : [];

  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return null;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const upcoming = slots.map((slot: any) => {
    const slotMinutes = toMinutes(slot.start_time);
    let dayDiff = slot.day_of_week - currentDay;

    if (dayDiff < 0) {
      dayDiff += 7; // Next week
    } else if (dayDiff === 0 && slotMinutes <= currentMinutes) {
      // Same day but already started or in the past → schedule for next week
      dayDiff += 7;
    }

    const minutesUntil = dayDiff * 24 * 60 + (slotMinutes - currentMinutes);

    // Compute an absolute start timestamp for the next occurrence
    const [h, m] = slot.start_time.split(":").map(Number);
    const startAt = new Date(now);
    startAt.setDate(now.getDate() + dayDiff);
    startAt.setHours(h || 0, m || 0, 0, 0);

    return { ...slot, minutesUntil, startAt };
  });

  // Sort by nearest
  upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil);
  const nextSlot = upcoming[0];
  if (!nextSlot) return null;

  const program = await prisma.bingoProgram.findUnique({
    where: { slug: nextSlot.program_slug },
    select: { name: true, slug: true },
  });

  return {
    type: "schedule",
    dayOfWeek: nextSlot.day_of_week,
    startTime: nextSlot.start_time,
    startAt: nextSlot.startAt.toISOString(),
    minutesUntil: nextSlot.minutesUntil,
    programName: program?.name || "Bingo Session",
    programSlug: program?.slug || nextSlot.program_slug,
  };
});