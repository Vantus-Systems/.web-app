import { defineEventHandler, readBody, createError } from "h3";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { z, ZodError } from "zod";
import { assertAnyPermission } from "~/server/utils/permissions";
import type { CalendarOverride } from "~/types/schedule";

const doorTimeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM (24h)"),
});

export default defineEventHandler(async (event) => {
  assertAnyPermission(event.context.user?.role, ["ops:edit"]);

  let payload;
  try {
    payload = doorTimeSchema.parse(await readBody(event));
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid door time payload",
        data: error.flatten(),
      });
    }
    throw error;
  }

  const { date, time } = payload;
  const key = "calendar_overrides";

  const existingOverrides = (await settingsService.get(key)) as Record<
    string,
    CalendarOverride[]
  > | null;

  const overridesMap = existingOverrides ?? {};
  const beforeSnapshot = existingOverrides
    ? JSON.parse(JSON.stringify(existingOverrides))
    : null;

  if (!overridesMap[date]) {
    overridesMap[date] = [];
  }

  const dateOverrides = overridesMap[date];
  const existingIdx = dateOverrides.findIndex((o) => o.kind === "DOORS_OPEN");

  if (existingIdx >= 0) {
    dateOverrides[existingIdx].doorsOpenTime = time;
    dateOverrides[existingIdx].reason = "Manual Door Time Set via Admin Home";
  } else {
    const newOverride: CalendarOverride = {
      date,
      kind: "DOORS_OPEN",
      doorsOpenTime: time,
      reason: "Manual Door Time Set via Admin Home",
    };
    dateOverrides.push(newOverride);
  }

  await settingsService.set(key, overridesMap);

  await auditService.log({
    actorUserId: event.context.user?.id,
    action: "UPDATE_SETTING",
    entity: `setting:${key}`,
    before: beforeSnapshot,
    after: JSON.parse(JSON.stringify(overridesMap)),
  });

  return { success: true, message: "Door time updated in Schedule Overrides" };
});
