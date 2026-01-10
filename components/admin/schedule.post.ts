import { defineEventHandler, readBody } from "h3";
import { z } from "zod";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { assertAnyPermission } from "~/server/utils/permissions";

// Flexible schema for schedule configuration (e.g. default sessions, times)
const scheduleSchema = z.record(z.any());

export default defineEventHandler(async (event) => {
  assertAnyPermission(event.context.user?.role, ["OWNER", "ops:edit"]);

  const body = await readBody(event);
  const data = scheduleSchema.parse(body);

  const before = await settingsService.get("schedule");

  // Persist
  await settingsService.set("schedule", data);

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SETTING",
    entity: "setting:schedule",
    before,
    after: data,
  });

  return { success: true };
});