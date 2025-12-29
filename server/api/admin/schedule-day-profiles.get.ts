import { defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const data = await settingsService.get("schedule_day_profiles");
  return data || {
    profiles: [],
    assignments: {},
    overrides: {},
  };
});
