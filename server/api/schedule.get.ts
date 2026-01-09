import { defineEventHandler } from "h3";
import { PrismaClient } from "@prisma/client";
import { settingsService } from "@server/services/settings.service";
import { DAYS_OF_WEEK } from "~/types/schedule";

const prisma = new PrismaClient();

const getCategory = (time: string): string => {
  if (!time) return "Evening";
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

  // Default meta
  const meta = {
    effectiveDate: new Date().toISOString(),
    lastPublishedAt: activeVersion?.published_at?.toISOString() || null,
    lastUpdatedBy: activeVersion?.published_by || null,
    timezone: "America/Chicago",
  };

  if (!activeVersion) {
    const legacySchedule = await settingsService.get("schedule");
    return {
      sessions: legacySchedule || [],
      meta
    };
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
      if (!program) return null;

      // Calculate end time
      // slot.start_time is required String in schema
      const [startH, startM] = slot.start_time.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(startH || 0, startM || 0, 0, 0);
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
        sortOrder: g.sort_order,
        title: g.title,
        paperColor: g.paperColor,
        notes: g.notes,
        pattern: {
            slug: g.pattern.slug,
            name: g.pattern.name,
            description: g.pattern.description,
            isAnimated: g.pattern.isAnimated,
            definition: typeof g.pattern.definition === 'string' ? JSON.parse(g.pattern.definition) : g.pattern.definition
        },
      }));

      const gamesLegacy = program.games.map(g => ({
         number: g.sort_order,
         name: g.title,
         detail: `${g.pattern.name} • ${g.notes || ""}`
      }));

      let specials = slot.overrides || {};
      if (typeof specials === "string") {
        try {
          specials = JSON.parse(specials);
        } catch {
          specials = {};
        }
      }

      return {
        id: slot.id,
        name: program.name,
        category: getCategory(slot.start_time),
        startTime: slot.start_time,
        endTime,
        gameType: "Regular",
        description: program.description || "",
        vibe: [],
        pricing: {
          type: "Standard",
        },
        jackpot: "",
        status: "Upcoming",
        eligibility: "All Ages",
        availableDays: [DAYS_OF_WEEK[slot.day_of_week]],
        games: gamesLegacy,
        programSlug: program.slug,
        specials,
      };
    })
    .filter(Boolean);

  return {
    sessions,
    meta
  };
});
