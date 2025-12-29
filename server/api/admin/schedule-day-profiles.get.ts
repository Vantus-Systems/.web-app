import { createError, defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const data = await settingsService.get("schedule_day_profiles");
  return (
    data || {
      profiles: [],
      assignments: {},
      overrides: {},
    }
  );
});
