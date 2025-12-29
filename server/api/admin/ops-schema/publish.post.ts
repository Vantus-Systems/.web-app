import { createError, defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { compileOpsSchema } from "@server/services/opsSchemaCompiler";
import { opsSchemaV2Schema } from "@server/schemas/ops-schema.zod";
import { ZodError } from "zod";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const draft = await settingsService.get("ops_schema_draft");
  if (!draft) {
    throw createError({
      statusCode: 400,
      message: "No ops schema draft found to publish.",
    });
  }

  let parsed;
  try {
    parsed = opsSchemaV2Schema.parse(draft);
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid ops schema payload.",
        data: error.flatten(),
      });
    }
    throw error;
  }
  const publishedSchema = {
    ...parsed,
    meta: { ...parsed.meta, status: "live" },
  };

  const [history, currentPricing, currentSchedule] = await Promise.all([
    settingsService.get("ops_schema_history"),
    settingsService.get("pricing"),
    settingsService.get("schedule"),
  ]);

  const compiled = compileOpsSchema(publishedSchema, {
    previousPricing: currentPricing,
    previousSchedule: currentSchedule,
  });

  const nextHistory = Array.isArray(history) ? [...history] : [];
  nextHistory.unshift({
    id: `${Date.now()}`,
    published_at: new Date().toISOString(),
    schema: publishedSchema,
  });

  await settingsService.set("ops_schema_live", publishedSchema);
  await settingsService.set("ops_schema_history", nextHistory);
  await settingsService.set("pricing", compiled.pricing);
  await settingsService.set("schedule", compiled.schedule);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "PUBLISH_OPS_SCHEMA",
    entity: "setting:ops_schema_live",
    before: null,
    after: publishedSchema,
  });

  return { success: true };
});
