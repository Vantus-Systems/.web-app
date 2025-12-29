import { z } from "zod";

export const shiftWorkflowSchema = z.enum([
  "NORMAL",
  "NEGATIVE_BINGO_BOX",
  "RECUPERATION_BOX_RETURN",
]);

export const shiftRecordInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shift: z.enum(["AM", "PM"]),
  pulltabs_total: z.number().min(0),
  deposit_total: z.number().min(0).optional(),
  players: z.number().int().min(0).optional(),
  workflow_type: shiftWorkflowSchema,
  beginning_box: z.number().min(0).optional(),
  ending_box: z.number().min(0).optional(),
  bingo_actual: z.number().optional(),
  deposit_actual: z.number().optional(),
  notes: z.string().optional(),
  prev_shift_id: z.string().optional(),
});

export const shiftRecordUpdateSchema = shiftRecordInputSchema.partial().extend({
  id: z.string().optional(),
});

export const shiftRecordQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  userId: z.string().optional(),
});
