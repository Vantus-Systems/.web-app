import { defineEventHandler, readBody, createError } from "h3";
import { settingsService } from "@server/services/settings.service";
import { v4 as uuidv4 } from "uuid";
import { assertAnyPermission } from "~/server/utils/permissions";
import type {
  OpsSchemaV2,
  OpsSchemaCalendarOverride,
} from "~/types/ops-schema";

export default defineEventHandler(async (event) => {
  assertAnyPermission(event.context.user?.role, ["ops:edit"]);

  const body = await readBody(event);
  const { date, time } = body;

  if (!date || !time) {
    throw createError({
      statusCode: 400,
      statusMessage: "Date and Time are required",
    });
  }

  // Load Draft Schedule
  const schedule = (await settingsService.get(
    "ops_schedule_draft",
  )) as OpsSchemaV2;
  if (!schedule) {
    throw createError({
      statusCode: 404,
      statusMessage: "Schedule draft not found",
    });
  }

  // Ensure overrides object exists
  if (!schedule.calendar.overrides) {
    schedule.calendar.overrides = {};
  }
  if (!schedule.calendar.overrides[date]) {
    schedule.calendar.overrides[date] = [];
  }

  const overrides = schedule.calendar.overrides[date];

  // Check if DOORS_OPEN override exists
  const existingIdx = overrides.findIndex((o) => o.kind === "DOORS_OPEN");

  if (existingIdx >= 0) {
    // Update existing
    overrides[existingIdx].doors_open_time = time;
    overrides[existingIdx].reason = "Manual Door Time Set via Admin Home";
  } else {
    // Add new
    const newOverride: OpsSchemaCalendarOverride = {
      id: uuidv4(),
      kind: "DOORS_OPEN",
      doors_open_time: time,
      reason: "Manual Door Time Set via Admin Home",
    };
    overrides.push(newOverride);
  }

  // Save Schedule
  await settingsService.set("ops_schedule_draft", schedule);

  return { success: true, message: "Door time updated in Draft Schedule" };
});
