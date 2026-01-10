import { defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";
import prisma from "@server/db/client";

export default defineEventHandler(async () => {
  const schedule = (await settingsService.get("schedule")) as any[];
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return null;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Helper: minutes from midnight
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Calculate time until each slot
  const upcoming = schedule.map((slot) => {
    const slotMinutes = toMinutes(slot.start_time);
    let dayDiff = slot.day_of_week - currentDay;

    if (dayDiff < 0) {
      dayDiff += 7; // Next week
    } else if (dayDiff === 0 && slotMinutes < currentMinutes) {
      dayDiff = 7; // Next week (same day but earlier time)
    }

    const minutesUntil = dayDiff * 24 * 60 + (slotMinutes - currentMinutes);
    return { ...slot, minutesUntil };
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
    ...nextSlot,
    programName: program?.name || "Bingo Session",
    programSlug: program?.slug || nextSlot.program_slug,
  };
});