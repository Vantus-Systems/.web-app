import { defineEventHandler, readBody, createError } from "h3";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { assertRole } from "@server/utils/roles";
import { homepageSchema } from "@server/schemas/homepage";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);

  // Validate input
  const result = homepageSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid homepage settings",
      data: result.error.errors,
    });
  }

  const currentSettings = await settingsService.get("homepage");

  // Save new settings
  const updatedSettings = await settingsService.set("homepage", result.data);

  // Audit log
  await auditService.log({
    actorUserId: event.context.user?.id,
    action: "UPDATE_HOMEPAGE",
    entity: "homepage",
    before: currentSettings,
    after: updatedSettings,
  });

  return updatedSettings;
});
