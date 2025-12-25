// server/api/admin/schedule.post.ts
import { defineEventHandler, createError, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";

const scheduleItemSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
  })
  .passthrough();

const scheduleSchema = z.array(scheduleItemSchema);

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const parsed = scheduleSchema.parse(body);
  const before = await settingsService.get("schedule");

  await settingsService.set("schedule", parsed);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:schedule",
    before,
    after: parsed,
  });

  return { success: true };
});
