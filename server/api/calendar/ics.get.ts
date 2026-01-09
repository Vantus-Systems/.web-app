import { defineEventHandler, getQuery, setResponseHeader } from "h3";
import { PrismaClient } from "@prisma/client";
import { createEvents, type EventAttributes } from "ics";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const sessionId = query.sessionId as string;
  const dateStr = query.date as string; // Target date YYYY-MM-DD

  if (!sessionId || !dateStr) {
    throw createError({
        statusCode: 400,
        statusMessage: "Missing sessionId or date"
    });
  }

  const slot = await prisma.scheduleSlot.findUnique({
      where: { id: sessionId },
      include: {
          schedule_version: true
      }
  });

  if (!slot) {
       throw createError({ statusCode: 404, statusMessage: "Session not found" });
  }

  const program = await prisma.bingoProgram.findUnique({
      where: { slug: slot.program_slug }
  });

  if (!program) {
       throw createError({ statusCode: 404, statusMessage: "Program not found" });
  }

  const [startH, startM] = slot.start_time.split(":").map(Number);
  const [year, month, day] = dateStr.split("-").map(Number);

  const durationMinutes = slot.duration_minutes;
  const duration = { hours: Math.floor(durationMinutes / 60), minutes: durationMinutes % 60 };

  // Cast numbers to ensure they are not undefined
  // createEvents expects [number, number, number, number, number]
  const start: [number, number, number, number, number] = [
      year || 0,
      month || 0,
      day || 0,
      startH || 0,
      startM || 0
  ];

  const icsEvent: EventAttributes = {
      start,
      duration,
      title: program.name,
      description: program.description || "Join us for Bingo!",
      location: "Mary Esther Bingo",
      url: "https://maryestherbingo.com",
      categories: ["Bingo", slot.day_of_week.toString()],
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: { name: "Mary Esther Bingo", email: "info@maryestherbingo.com" },
  };

  const { error, value } = createEvents([icsEvent]);

  if (error) {
      console.error(error);
      throw createError({ statusCode: 500, statusMessage: "Failed to generate ICS" });
  }

  setResponseHeader(event, 'Content-Type', 'text/calendar');
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="bingo-session-${dateStr}.ics"`);

  return value;
});
