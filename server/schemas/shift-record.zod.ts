import { z } from "zod";

export const shiftDesignationSchema = z.enum(["AM", "PM"]);
export const shiftWorkflowSchema = z.enum([
  "NORMAL",
  "NEGATIVE_BINGO_BOX",
  "RECUPERATION_BOX_RETURN",
]);

export type ShiftDesignation = z.infer<typeof shiftDesignationSchema>;
export type ShiftWorkflowType = z.infer<typeof shiftWorkflowSchema>;

const baseShiftSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  shift: shiftDesignationSchema,
  pulltabs_total: z.number().min(0),
  deposit_total: z.number().min(0).optional(),
  deposit_bank_total: z.number().min(0).optional(),
  players: z.number().int().min(0).optional(),
  workflow_type: shiftWorkflowSchema,
  beginning_box: z.number().min(0).optional(),
  ending_box: z.number().min(0).optional(),
  bingo_actual: z.number().optional(),
  deposit_actual: z.number().optional(),
  notes: z.string().optional(),
  prev_shift_id: z.string().optional(),
});

export const shiftRecordInputSchema = baseShiftSchema.refine(
  (data) => {
    if (
      data.deposit_total !== undefined &&
      data.deposit_bank_total !== undefined
    ) {
      return data.deposit_total === data.deposit_bank_total;
    }
    return true;
  },
  {
    message: "deposit_bank_total must match deposit_total (legacy field)",
    path: ["deposit_bank_total"],
  },
);

export const shiftRecordUpdateSchema = baseShiftSchema
  .partial()
  .extend({
    id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.deposit_total !== undefined &&
        data.deposit_bank_total !== undefined
      ) {
        return data.deposit_total === data.deposit_bank_total;
      }
      return true;
    },
    {
      message: "deposit_bank_total must match deposit_total (legacy field)",
      path: ["deposit_bank_total"],
    },
  );

export const shiftRecordQuerySchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  userId: z.string().optional(),
  shift: shiftDesignationSchema.optional(),
  workflow: shiftWorkflowSchema.optional(),
});
