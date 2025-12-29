import { createError, defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { compileOpsSchema } from "@server/services/opsSchemaCompiler";
import { opsSchemaV2Schema } from "@server/schemas/ops-schema.zod";

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const draft = await settingsService.get("ops_schema_draft");
  if (!draft) {
    throw createError({
      statusCode: 400,
      message: "No ops schema draft found to publish.",
    });
  }

  const parsed = opsSchemaV2Schema.parse(draft);
  const publishedSchema = {
    ...parsed,
    meta: { ...parsed.meta, status: "active" },
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
