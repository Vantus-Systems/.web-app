// server/api/admin/business.post.ts
import { defineEventHandler, createError, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";

const businessSchema = z
  .object({
    name: z.string().optional(),
    address: z.any().optional(),
    contact: z.any().optional(),
    hours: z.string().optional(),
    social: z.any().optional(),
    meta: z.any().optional(),
  })
  .passthrough();

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const parsed = businessSchema.parse(body);
  const before = await settingsService.get("business");

  await settingsService.set("business", parsed);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:business",
    before,
    after: parsed,
  });

  return { success: true };
});
