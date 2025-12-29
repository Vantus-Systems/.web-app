// server/api/admin/jackpot.post.ts
import { defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

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
  assertRole(event.context.user?.role, ["OWNER"]);

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
