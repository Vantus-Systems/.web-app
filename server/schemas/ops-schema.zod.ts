import { z } from "zod";
import {
  detectOverlaps,
  isTimeWithinRange,
  normalizeTimeRange,
} from "~/utils/ops-schema.utils";

const timeHHMM = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format");

const dateYYYYMMDD = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const inventoryTierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
});

const bundleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  items: z.array(z.string().min(1)),
  price: z.number().nonnegative(),
  discount_label: z.string().optional(),
  savings: z.number().optional(),
});

const rateCardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional(),
  color: z.string().optional(),
  yield_configuration: z.object({
    mode: z.enum(["fixed_rate", "standard_rate", "reduced_rate"]),
    active_bundles: z.array(z.string()),
    qualifying_criteria: z
      .object({
        min_spend: z.number().optional(),
        free_unit_ratio: z.string().optional(),
      })
      .optional(),
  }),
});

const flowSegmentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  time_start: timeHHMM,
  time_end: timeHHMM,
  rate_card_id: z.string().min(1),
  color_code: z.string().optional(),
  allow_overlap: z.boolean().optional(),
});

const overlayEventSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  time_start: timeHHMM,
  time_end: timeHHMM,
  is_hard_ticket: z.boolean(),
  pricing_override: z.record(z.unknown()).optional(),
});

const logicTriggerSchema = z.object({
  id: z.string().min(1),
  trigger_time: timeHHMM,
  type: z.enum(["hard_reset", "sales_window_open"]),
  target_event: z.string().optional(),
  description: z.string().optional(),
});

const dayProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["weekday", "weekend", "special", "closed"]),
  segment_ids: z.array(z.string().min(1)),
  overlay_event_ids: z.array(z.string().min(1)),
  description: z.string().optional(),
  color: z.string().optional(),
});

const calendarAssignmentSchema = z.object({
  status: z.enum(["open", "closed"]),
  profile_id: z.string().optional(),
});

const calendarOverrideSchema = z.object({
  id: z.string().min(1),
  profile_id: z.string().min(1),
  reason: z.string().optional(),
});

const enumerateDates = (start: string, end: string) => {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  while (cursor <= endDate) {
    const iso = cursor.toISOString().slice(0, 10);
    dates.push(iso);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

export const opsSchemaV2Schema = z
  .object({
    schema_version: z.string().min(1),
    meta: z.object({
      name: z.string().min(1),
      status: z.enum(["draft", "live"]),
      currency: z.string().min(1),
      timezone: z.string().min(1),
      schema_version: z.string().min(1),
    }),
    definitions: z.object({
      inventoryTiers: z.array(inventoryTierSchema),
      bundles: z.array(bundleSchema),
      rateCards: z.array(rateCardSchema),
    }),
    timeline: z.object({
      operationalHours: z.object({
        start: timeHHMM,
        end: timeHHMM,
        isOpen: z.boolean(),
      }),
      flowSegments: z.array(flowSegmentSchema),
      overlayEvents: z.array(overlayEventSchema),
    }),
    logicTriggers: z.array(logicTriggerSchema),
    dayProfiles: z.array(dayProfileSchema),
    calendar: z.object({
      range: z.object({
        start: dateYYYYMMDD,
        end: dateYYYYMMDD,
      }),
      weekdayDefaults: z.record(calendarAssignmentSchema),
      assignments: z.record(calendarAssignmentSchema),
      overrides: z.record(z.array(calendarOverrideSchema)),
    }),
  })
  .superRefine((schema, ctx) => {
    if (schema.schema_version !== schema.meta.schema_version) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "schema_version must match meta.schema_version.",
        path: ["meta", "schema_version"],
      });
    }

    const rangeStart = new Date(`${schema.calendar.range.start}T00:00:00`);
    const rangeEnd = new Date(`${schema.calendar.range.end}T00:00:00`);
    if (rangeStart > rangeEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Calendar range start must be before range end.",
        path: ["calendar", "range"],
      });
    }

    const rateCardIds = new Set(schema.definitions.rateCards.map((card) => card.id));
    schema.timeline.flowSegments.forEach((segment, index) => {
      if (!rateCardIds.has(segment.rate_card_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Flow segment rate_card_id not found: ${segment.rate_card_id}`,
          path: ["timeline", "flowSegments", index, "rate_card_id"],
        });
      }
    });

    const overlayIds = new Set(schema.timeline.overlayEvents.map((event) => event.id));
    schema.logicTriggers.forEach((trigger, index) => {
      if (trigger.target_event && !overlayIds.has(trigger.target_event)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Trigger target_event not found: ${trigger.target_event}`,
          path: ["logicTriggers", index, "target_event"],
        });
      }
    });

    const segmentIds = new Set(schema.timeline.flowSegments.map((segment) => segment.id));
    schema.dayProfiles.forEach((profile, index) => {
      profile.segment_ids.forEach((id) => {
        if (!segmentIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Day profile segment_id not found: ${id}`,
            path: ["dayProfiles", index, "segment_ids"],
          });
        }
      });
      profile.overlay_event_ids.forEach((id) => {
        if (!overlayIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Day profile overlay_event_id not found: ${id}`,
            path: ["dayProfiles", index, "overlay_event_ids"],
          });
        }
      });
    });

    detectOverlaps(schema.timeline.flowSegments).forEach((pair) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Flow segments overlap: ${pair.a.label} ↔ ${pair.b.label}`,
        path: ["timeline", "flowSegments"],
      });
    });

    schema.timeline.overlayEvents.forEach((event, index) => {
      if (
        !isTimeWithinRange(
          event.time_start,
          schema.timeline.operationalHours.start,
          schema.timeline.operationalHours.end,
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Overlay event ${event.label} starts outside operational hours.`,
          path: ["timeline", "overlayEvents", index, "time_start"],
        });
      }
      if (
        !isTimeWithinRange(
          event.time_end,
          schema.timeline.operationalHours.start,
          schema.timeline.operationalHours.end,
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Overlay event ${event.label} ends outside operational hours.`,
          path: ["timeline", "overlayEvents", index, "time_end"],
        });
      }
    });

    const range = normalizeTimeRange(
      schema.timeline.operationalHours.start,
      schema.timeline.operationalHours.end,
    );
    if (range.start === range.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Operational hours must span a non-zero duration.",
        path: ["timeline", "operationalHours"],
      });
    }

    const profileIds = new Set(schema.dayProfiles.map((profile) => profile.id));
    const validateAssignment = (
      assignment: z.infer<typeof calendarAssignmentSchema>,
      path: Array<string | number>,
      date: string,
    ) => {
      if (!profileIds.has(assignment.profile_id ?? "") && assignment.status === "open") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Calendar assignment profile_id not found for ${date}`,
          path,
        });
      }
      if (assignment.status === "closed" && assignment.profile_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Closed calendar assignment should not reference a profile (${date}).`,
          path,
        });
      }
    };

    Object.entries(schema.calendar.weekdayDefaults).forEach(
      ([day, assignment]) => {
        validateAssignment(assignment, ["calendar", "weekdayDefaults", day], day);
      },
    );

    Object.entries(schema.calendar.assignments).forEach(
      ([date, assignment]) => {
        validateAssignment(assignment, ["calendar", "assignments", date], date);
      },
    );

    const dates = enumerateDates(schema.calendar.range.start, schema.calendar.range.end);
    dates.forEach((date) => {
      const weekday = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
      });
      const assignment =
        schema.calendar.assignments[date] || schema.calendar.weekdayDefaults[weekday];
      if (!assignment) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Calendar date ${date} is missing an assignment.`,
          path: ["calendar", "assignments"],
        });
      } else {
        validateAssignment(assignment, ["calendar", "assignments", date], date);
      }
    });

    Object.entries(schema.calendar.overrides).forEach(([date, entries]) => {
      entries.forEach((entry, index) => {
        if (!profileIds.has(entry.profile_id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Calendar override profile_id not found for ${date}`,
            path: ["calendar", "overrides", date, index, "profile_id"],
          });
        }
      });
    });
  });
