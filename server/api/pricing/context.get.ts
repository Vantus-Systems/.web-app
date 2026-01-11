import { defineEventHandler } from "h3";
import prisma from "~/server/db/client";
import { settingsService } from "@server/services/settings.service";

export default defineEventHandler(async () => {
  // Get current time in Chicago timezone
  const now = new Date();
  const chicagoTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const currentHour = chicagoTime.getHours();
  const dayOfWeek = chicagoTime.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Determine session type based on current time
  const getSessionType = (hour: number): string => {
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    if (hour < 21) return "Evening";
    return "Late Night";
  };

  // Get active schedule
  const activeSchedule = await prisma.scheduleVersion.findFirst({
    where: { status: "ACTIVE" },
    include: { slots: true },
  });

  let currentSessionProgram = null;
  if (activeSchedule?.slots) {
    // Find the next or current session
    const currentSlot = activeSchedule.slots.find(
      (slot) =>
        slot.day_of_week === dayOfWeek &&
        parseInt(slot.start_time.split(":")[0]) >= currentHour
    );
    if (currentSlot) {
      currentSessionProgram = currentSlot.program_slug;
    }
  }

  // Get pricing information
  const activePricingVersion = await prisma.pricingVersion.findFirst({
    where: { status: "ACTIVE" },
  });

  let pricingData = {};
  if (activePricingVersion) {
    try {
      pricingData = JSON.parse(activePricingVersion.content);
    } catch (e) {
      console.error("Failed to parse pricing:", e);
      pricingData = await settingsService.get("pricing");
    }
  } else {
    pricingData = await settingsService.get("pricing");
  }

  return {
    currentTime: chicagoTime.toISOString(),
    dayOfWeek,
    dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek],
    sessionType: getSessionType(currentHour),
    currentSessionProgram,
    pricingContext: {
      isDaytime: currentHour >= 10 && currentHour < 17,
      isEvening: currentHour >= 17 && currentHour < 22,
      isMorning: currentHour < 12,
      isAfternoon: currentHour >= 12 && currentHour < 17,
    },
    pricing: pricingData,
  };
});
