// server/api/admin/jackpot.post.ts
import { randomUUID } from "node:crypto";
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
  lastWonDate: z.string().optional(),
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

  // Normalize incoming items and ensure IDs exist (persist canonical shape)
  const normalizedItems = parsed.items.map((item) => ({
    id: item.id || randomUUID(),
    label: item.label || "Progressive",
    current: Number(item.current) || 0,
    backup: Number(item.backup) || 0,
    playTime: item.playTime || "",
    isSession: Boolean(item.isSession),
    lastWonDate: item.lastWonDate || undefined,
  }));

  const normalized = {
    items: normalizedItems,
    lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    lastDailyUpdate: parsed.lastDailyUpdate || undefined,
  };

  const before = await settingsService.get("jackpot");

  await settingsService.set("jackpot", normalized);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:jackpot",
    before,
    after: normalized,
  });

  return { success: true };
});
