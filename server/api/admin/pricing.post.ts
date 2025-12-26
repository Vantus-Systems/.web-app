// server/api/admin/pricing.post.ts
import { defineEventHandler, createError, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";

const pricingSchema = z
  .object({
    daytime: z.any().optional(),
    evening: z.any().optional(),
    sunday: z.any().optional(),
    faqs: z.array(z.any()).optional(),
  })
  .passthrough();

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const parsed = pricingSchema.parse(body);
  const before = await settingsService.get("pricing");

  await settingsService.set("pricing", parsed);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:pricing",
    before,
    after: parsed,
  });

  return { success: true };
});
