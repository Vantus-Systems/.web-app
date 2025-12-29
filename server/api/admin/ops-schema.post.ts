import { createError, defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";

const opsSchemaMetaSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["Draft", "Live"]),
  version: z.number().int().min(1),
  updatedAt: z.string().min(1),
});

const opsSchemaSchema = z.object({
  meta: opsSchemaMetaSchema,
  definitions: z.object({
    rateCards: z.array(z.any()),
    bundles: z.array(z.any()),
    inventoryTiers: z.array(z.any()),
  }),
  timelineConfiguration: z.object({
    flowSegments: z.array(z.any()),
    overlayEvents: z.array(z.any()),
  }),
  logicTriggers: z.array(z.any()),
  dayProfiles: z.array(z.any()),
});

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const parsed = opsSchemaSchema.parse(body);
  const before = await settingsService.get("ops_schema_v2");

  await settingsService.set("ops_schema_v2", parsed);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:ops_schema_v2",
    before,
    after: parsed,
  });

  return { success: true };
});
