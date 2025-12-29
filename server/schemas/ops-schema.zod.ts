import { z } from "zod";

const timeHHMM = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format");

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
});

export const opsSchemaV2Schema = z
  .object({
    schema_version: z.string().min(1),
    meta: z.object({
      profile_name: z.string().min(1),
      status: z.enum(["draft", "active"]),
      currency: z.string().min(1),
      timezone: z.string().min(1),
    }),
    definitions: z.object({
      inventory_tiers: z.record(inventoryTierSchema),
      bundles: z.record(bundleSchema),
      rate_cards: z.record(rateCardSchema),
    }),
    timeline_configuration: z.object({
      flow_segments: z.array(flowSegmentSchema),
      overlay_events: z.array(overlayEventSchema),
    }),
    logic_triggers: z.array(logicTriggerSchema),
    day_profiles: z.array(dayProfileSchema),
    calendar: z.object({
      assignments: z.record(z.string()),
      overrides: z.record(
        z.array(
          z.object({
            id: z.string().min(1),
            profile_id: z.string().min(1),
          }),
        ),
      ),
    }),
  })
  .superRefine((schema, ctx) => {
    const rateCardIds = new Set(
      Object.values(schema.definitions.rate_cards).map((card) => card.id),
    );
    schema.timeline_configuration.flow_segments.forEach((segment, index) => {
      if (!rateCardIds.has(segment.rate_card_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Flow segment rate_card_id not found: ${segment.rate_card_id}`,
          path: ["timeline_configuration", "flow_segments", index, "rate_card_id"],
        });
      }
    });

    const overlayIds = new Set(
      schema.timeline_configuration.overlay_events.map((event) => event.id),
    );
    schema.logic_triggers.forEach((trigger, index) => {
      if (trigger.target_event && !overlayIds.has(trigger.target_event)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Trigger target_event not found: ${trigger.target_event}`,
          path: ["logic_triggers", index, "target_event"],
        });
      }
    });

    const segmentIds = new Set(
      schema.timeline_configuration.flow_segments.map((segment) => segment.id),
    );
    schema.day_profiles.forEach((profile, index) => {
      profile.segment_ids.forEach((id) => {
        if (!segmentIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Day profile segment_id not found: ${id}`,
            path: ["day_profiles", index, "segment_ids"],
          });
        }
      });
      profile.overlay_event_ids.forEach((id) => {
        if (!overlayIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Day profile overlay_event_id not found: ${id}`,
            path: ["day_profiles", index, "overlay_event_ids"],
          });
        }
      });
    });
  });
