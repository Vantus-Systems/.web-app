import { defineEventHandler, readBody, createError } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { assertAnyPermission } from "~/server/utils/permissions";

const specialItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

const specialsPayloadSchema = z.object({
  items: z.array(specialItemSchema),
});

export default defineEventHandler(async (event) => {
  assertAnyPermission(event.context.user?.role, ["OWNER", "ops:edit"]);

  const body = await readBody(event);
  const { items } = specialsPayloadSchema.parse(body);

  const before = await settingsService.get("specials");
  
  // Persist to settings store
  await settingsService.set("specials", { items, lastUpdated: new Date().toISOString() });

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:specials",
    before,
    after: { items },
  });

  return { success: true };
});