// server/api/admin/jackpot.post.ts
import { defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

const progressiveSchema = z.object({
  id: z.string().optional(), // optional because new items might not have it yet from client, but we should generate it
  label: z.string().optional(),
  current: z.number(),
  backup: z.number(),
  playTime: z.string().optional(),
  isSession: z.boolean().optional(),
});

const jackpotSchema = z
  .object({
    items: z.array(progressiveSchema),
    lastUpdated: z.string().optional(),
  })
  .passthrough();

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  const parsed = jackpotSchema.parse(body);

  // Ensure IDs exist
  parsed.items = parsed.items.map((item) => ({
    ...item,
    id: item.id || crypto.randomUUID(),
  }));

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
