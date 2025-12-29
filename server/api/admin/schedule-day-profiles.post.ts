import { createError, defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";

const scheduleDayProfilesSchema = z.object({
  profiles: z.array(z.any()),
  assignments: z.record(z.string()),
  overrides: z.record(z.array(z.any())),
});

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const parsed = scheduleDayProfilesSchema.parse(body);
  const before = await settingsService.get("schedule_day_profiles");

  await settingsService.set("schedule_day_profiles", parsed);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:schedule_day_profiles",
    before,
    after: parsed,
  });

  return { success: true };
});
