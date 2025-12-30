import { createError, defineEventHandler, readBody } from "h3";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { opsSchemaV2Schema } from "@server/schemas/ops-schema.zod";
import { ZodError } from "zod";
import { assertPermission } from "~/server/utils/permissions";

export default defineEventHandler(async (event) => {
  assertPermission(event.context.user?.role, "ops:edit");

  const body = await readBody(event);
  let parsed;
  try {
    parsed = opsSchemaV2Schema.parse(body);
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
  const before = await settingsService.get("ops_schema_draft");

  await settingsService.set("ops_schema_draft", parsed);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:ops_schema_draft",
    before,
    after: parsed,
  });

  return { success: true };
});
