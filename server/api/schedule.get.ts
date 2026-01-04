import { defineEventHandler } from "h3";
import { PrismaClient } from "@prisma/client";
import { settingsService } from "@server/services/settings.service";
import { DAYS_OF_WEEK } from "~/types/schedule";

const prisma = new PrismaClient();

const getCategory = (time: string): string => {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  if (hour < 21) return "Evening";
  return "Late Night";
};

export default defineEventHandler(async () => {
  // 1. Try to fetch ACTIVE ScheduleVersion
  const activeVersion = await prisma.scheduleVersion.findFirst({
    where: { status: "ACTIVE" },
    include: { slots: true },
  });

  if (!activeVersion) {
    // Fallback to legacy settings if no active version found
    // This ensures backward compatibility until the first publish
    const legacySchedule = await settingsService.get("schedule");
    return legacySchedule || [];
  }

  // 2. Fetch all Programs to enrich the slots
  const programs = await prisma.bingoProgram.findMany({
    include: {
      games: {
        orderBy: { sort_order: "asc" },
        include: { pattern: true },
      },
    },
  });
  const programsBySlug = new Map(programs.map((p) => [p.slug, p]));

  // 3. Map slots to Session format
  const sessions = activeVersion.slots
    .map((slot) => {
      const program = programsBySlug.get(slot.program_slug);
      if (!program) return null; // Skip if program not found

      // Calculate end time
      const [startH, startM] = slot.start_time.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(startH, startM, 0, 0);
      const endDate = new Date(
        startDate.getTime() + slot.duration_minutes * 60000,
      );
      const endTime = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Map games
      const games = program.games.map((g) => ({
        number: g.sort_order,
        name: g.title,
        detail: `${g.pattern.name} • ${g.notes || ""}`,
      }));

      return {
        id: slot.id,
        name: program.name,
        category: getCategory(slot.start_time),
        startTime: slot.start_time, // Keep 24h for internal logic or transform? Frontend usually expects 24h or 12h?
        // Looking at ScheduleEventCard usage, it seems to take string.
        // Existing data likely had 24h or 12h. Let's check formatHHMM usage.
        // But typically standardized API returns 24h.
        // Wait, let's verify if `startTime` should be formatted.
        endTime, // Formatted 12h string?
        // Existing `server/services/opsSchemaCompiler.ts` returned `startTime: event.time_start` (HH:MM 24h likely).

        gameType: "Regular", // Default
        description: program.description || "",
        vibe: [], // Programs don't have tags yet, maybe add later?
        pricing: {
          type: "Standard",
          // Flatten pricing from first game or program metadata?
          // Programs don't have global pricing, games do.
          // For now leave empty or derive from first game?
        },
        jackpot: "", // Program doesn't have jackpot field.
        status: "Upcoming",
        eligibility: "All Ages",
        availableDays: [DAYS_OF_WEEK[slot.day_of_week]],
        games,
        specials: slot.overrides || {}, // Map overrides to specials?
      };
    })
    .filter(Boolean); // Remove nulls

  return sessions;
});
