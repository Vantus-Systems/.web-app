import { defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

// Flexible schema for pricing configuration to support the PricingManagerPanel
const pricingSchema = z.record(z.any());

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  const data = pricingSchema.parse(body);

  const before = await settingsService.get("pricing");

  // Persist
  await settingsService.set("pricing", data);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:pricing",
    before,
    after: data,
  });

  return { success: true };
});