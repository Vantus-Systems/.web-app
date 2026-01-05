import { z } from "zod";

export const scheduleSlotSchema = z.object({
  id: z.string().optional(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):(?:00|30)$/, "Time must be HH:00 or HH:30"),
  duration_minutes: z.number().int().positive(),
  program_slug: z.string().min(1),
  overrides: z.record(z.unknown()).optional().nullable(),
});

export const scheduleDraftSchema = z.object({
  slots: z.array(scheduleSlotSchema),
  week_start: z.string().optional(), // YYYY-MM-DD
});

export const pricingDraftSchema = z.object({
  content: z.record(z.unknown()),
});

const pricingMachineSchema = z.object({
  description: z.string(),
  price: z.string(),
  type: z.enum(["individual", "bundle", "premium"]),
  savings: z.string().optional(),
  badge: z.string().optional(),
});

const pricingSectionSchema = z.object({
  type: z.enum(["machines", "paperRules", "packages", "bullets", "note"]),
  title: z.string().optional(),
  items: z.array(z.any()),
});

const pricingSessionSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  timeRange: z.string(),
  icon: z.string(),
  machines: z.array(pricingMachineSchema),
  paperRules: z.object({
    minSpend: z.string(),
    minPaperCards: z.number(),
    description: z.string().optional(),
  }),
  paperRulesAdvanced: z.object({
    minSpendAdvanced: z.string(),
    maxPaperCards: z.string(),
    description: z.string().optional(),
  }),
  vibe: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  isVisible: z.boolean().optional(),
  sections: z.array(pricingSectionSchema).optional(),
});

const pricingJackpotSchema = z.object({
  name: z.string(),
  time: z.string(),
  prize: z.string(),
  description: z.string().optional(),
});

const pricingDaytimeSchema = z.object({
  sessions: z.array(pricingSessionSchema),
  jackpots: z.array(pricingJackpotSchema),
  paperOnlyGames: z
    .record(
      z.array(
        z.object({
          name: z.string(),
          cards: z.string(),
          price: z.string(),
        }),
      ),
    )
    .optional(),
});

const pricingEveningSchema = z.object({
  startTime: z.string(),
  valueProposition: z.string(),
  scheduleNote: z.string(),
  machines: z.array(pricingMachineSchema),
});

const pricingConfigSchema = z.object({
  daytime: pricingDaytimeSchema.optional(),
  evening: pricingEveningSchema.optional(),
});

const pricingPromotionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  badge: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  isActive: z.boolean(),
  sortOrder: z.number().optional(),
});

const pricingTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  config: pricingConfigSchema,
  isVisible: z.boolean().optional(),
});

const pricingDateOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  templateId: z.string(),
  note: z.string().optional(),
  isVisible: z.boolean().optional(),
});

const pricingSchemaV2 = z.object({
  schemaVersion: z.literal(2),
  templates: z.array(pricingTemplateSchema),
  defaultTemplateId: z.string(),
  // Keys support both the new day codes (Sun..Sat) and legacy numeric strings ("0".."6").
  weeklyRotation: z.record(z.string()),
  dateOverrides: z.array(pricingDateOverrideSchema),
  promotions: z.array(pricingPromotionSchema),
});

export const pricingContentSchema = z.union([
  pricingConfigSchema,
  pricingSchemaV2,
]);

export const rollbackSchema = z.object({
  versionId: z.string().min(1),
});
