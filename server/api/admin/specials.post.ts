// server/api/admin/specials.post.ts
import { defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

const specialsSchema = z
  .object({
    heroNote: z.string().optional(),
    weekly: z.array(z.any()).optional(),
    meta: z.any().optional(),
  })
  .passthrough();

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  const parsed = specialsSchema.parse(body);
  const before = await settingsService.get("specials");

  await settingsService.set("specials", parsed);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:specials",
    before,
    after: parsed,
  });

  return { success: true };
});
