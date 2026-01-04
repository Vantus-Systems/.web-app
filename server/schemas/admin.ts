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

export const rollbackSchema = z.object({
  versionId: z.string().min(1),
});
