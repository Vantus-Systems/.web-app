import { defineEventHandler, readBody, createError } from "h3";
import { settingsService } from "@server/services/settings.service";
import { auditService } from "@server/services/audit.service";
import { v4 as uuidv4 } from "uuid";
import { z, ZodError } from "zod";
import { assertAnyPermission } from "~/server/utils/permissions";
import type {
  OpsSchemaV2,
  OpsSchemaCalendarOverride,
} from "~/types/ops-schema";

const doorTimeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM (24h)"),
});

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const currentYearRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const buildDefaultWeekdayDefaults = (): Record<string, { status: "closed" }> =>
  weekDays.reduce(
    (acc, day) => {
      acc[day] = { status: "closed" };
      return acc;
    },
    {} as Record<string, { status: "closed" }>,
  );

const buildEmptyOpsSchemaDraft = (): OpsSchemaV2 => ({
  schema_version: "v2",
  meta: {
    name: "Operations Schema",
    status: "draft",
    currency: "USD",
    timezone: "America/Los_Angeles",
    schema_version: "v2",
  },
  definitions: {
    inventoryTiers: [],
    bundles: [],
    rateCards: [],
  },
  timeline: {
    operationalHours: {
      start: "09:00",
      end: "03:00",
      isOpen: true,
    },
    flowSegments: [],
    overlayEvents: [],
  },
  logicTriggers: [],
  dayProfiles: [],
  calendar: {
    range: currentYearRange(),
    weekdayDefaults: buildDefaultWeekdayDefaults(),
    assignments: {},
    overrides: {},
  },
});

const ensureCalendarShape = (schema: OpsSchemaV2) => {
  if (!schema.calendar) {
    schema.calendar = {
      range: currentYearRange(),
      weekdayDefaults: buildDefaultWeekdayDefaults(),
      assignments: {},
      overrides: {},
    };
  }
  if (!schema.calendar.range) {
    schema.calendar.range = currentYearRange();
  }
  if (!schema.calendar.weekdayDefaults) {
    schema.calendar.weekdayDefaults = buildDefaultWeekdayDefaults();
  }
  if (!schema.calendar.assignments) {
    schema.calendar.assignments = {};
  }
  if (!schema.calendar.overrides) {
    schema.calendar.overrides = {};
  }
};

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

  const existingDraft = (await settingsService.get(
    "ops_schema_draft",
  )) as OpsSchemaV2 | null;

  const schedule = existingDraft ?? buildEmptyOpsSchemaDraft();
  const beforeSnapshot = existingDraft
    ? JSON.parse(JSON.stringify(existingDraft))
    : null;

  ensureCalendarShape(schedule);

  if (!schedule.calendar.overrides[date]) {
    schedule.calendar.overrides[date] = [];
  }

  const overrides = schedule.calendar.overrides[date];
  const existingIdx = overrides.findIndex((o) => o.kind === "DOORS_OPEN");

  if (existingIdx >= 0) {
    overrides[existingIdx].doors_open_time = time;
    overrides[existingIdx].reason = "Manual Door Time Set via Admin Home";
  } else {
    const newOverride: OpsSchemaCalendarOverride = {
      id: uuidv4(),
      kind: "DOORS_OPEN",
      doors_open_time: time,
      reason: "Manual Door Time Set via Admin Home",
    };
    overrides.push(newOverride);
  }

  await settingsService.set("ops_schema_draft", schedule);

  await auditService.log({
    actorUserId: event.context.user?.id,
    action: "UPDATE_SETTING",
    entity: "setting:ops_schema_draft",
    before: beforeSnapshot,
    after: JSON.parse(JSON.stringify(schedule)),
  });

  return { success: true, message: "Door time updated in Draft Schedule" };
});
