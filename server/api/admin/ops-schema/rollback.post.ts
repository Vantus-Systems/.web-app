import { createError, defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const [live, history] = await Promise.all([
    settingsService.get("ops_schema_live"),
    settingsService.get("ops_schema_history"),
  ]);

  const fallback = live || (Array.isArray(history) ? history[0]?.schema : null);

  if (!fallback) {
    throw createError({
      statusCode: 400,
      message: "No live schema available to rollback.",
    });
  }

  await settingsService.set("ops_schema_draft", fallback);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "ROLLBACK_OPS_SCHEMA",
    entity: "setting:ops_schema_draft",
    before: null,
    after: fallback,
  });

  return { success: true };
});
