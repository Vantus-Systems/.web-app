// server/api/admin/jackpot.post.ts
import { defineEventHandler, createError, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";

const progressiveSchema = z.object({
  current: z.number(),
  backup: z.number(),
  label: z.string().optional(),
});

const jackpotSchema = z
  .object({
    babes: progressiveSchema,
    hornet: progressiveSchema,
    lastUpdated: z.string().optional(),
  })
  .passthrough();

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const parsed = jackpotSchema.parse(body);

  const before = await settingsService.get("jackpot");

  await settingsService.set("jackpot", parsed);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:jackpot",
    before,
    after: parsed,
  });

  return { success: true };
});
