import { defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";

export default defineEventHandler(async () => {
  const data = await settingsService.get("schedule");

  // Ensure array
  let schedule = Array.isArray(data) ? data : [];

  // Normalize specials keys
  schedule = schedule.map((session: any) => {
    if (session.specials && typeof session.specials === "object") {
      const normalizedSpecials: Record<string, string> = {};
      for (const [key, val] of Object.entries(session.specials)) {
        // Map "Tuesday" -> "Tue"
        const shortKey =
          key.length > 3
            ? key.substring(0, 3) // Simple truncation usually works for English days
            : key;
        // Ensure first letter cap
        const finalKey =
          shortKey.charAt(0).toUpperCase() + shortKey.slice(1).toLowerCase();
        normalizedSpecials[finalKey] = val as string;
      }
      return { ...session, specials: normalizedSpecials };
    }
    return session;
  });

  return schedule;
});
