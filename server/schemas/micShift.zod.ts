import { z } from "zod";

export const negativeBingoReasonCodeSchema = z.enum([
  "HighPayouts",
  "JackpotHit",
  "PromoNight",
  "Other",
]);

export type NegativeBingoReasonCode = z.infer<
  typeof negativeBingoReasonCodeSchema
>;

/**
 * Single cash denomination count (for Step 3: Cash Count Wizard)
 */
export const denominationCountSchema = z.object({
  denom_100_count: z.number().int().min(0).default(0),
  denom_50_count: z.number().int().min(0).default(0),
  denom_20_count: z.number().int().min(0).default(0),
  denom_10_count: z.number().int().min(0).default(0),
  denom_5_count: z.number().int().min(0).default(0),
  denom_1_count: z.number().int().min(0).default(0),
  denom_quarters: z.number().int().min(0).default(0),
  denom_dimes: z.number().int().min(0).default(0),
  denom_nickels: z.number().int().min(0).default(0),
  denom_pennies: z.number().int().min(0).default(0),
});

export type DenominationCount = z.infer<typeof denominationCountSchema>;

/**
 * Single check log entry (Step 4: Check Verification)
 * Requires: stamped_on_back + phone_dl_written to submit
 * Will be validated against restricted players on server
 */
export const checkLogInputSchema = z.object({
  player_name: z.string().min(1, "Player name required"),
  check_number: z.string().min(1, "Check number required"),
  amount: z.number().min(0.01, "Amount must be > $0"),
  stamped_on_back: z.boolean(),
  phone_dl_written: z.boolean(),
});

export type CheckLogInput = z.infer<typeof checkLogInputSchema>;

/**
 * MIC Shift Submission Payload (consolidated all steps)
 * This is what the user submits from the wizard
 */
export const micShiftSubmissionSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    shift: z.enum(["AM", "PM"]),

    // Step 1: Headcount
    headcount: z.number().int().min(0, "Headcount must be >= 0"),

    // Step 2: Sales (bingo_sales can be negative WITH reason code)
    sales_bingo: z.number(), // can be negative
    sales_pulltabs: z.number().min(0, "Pull tabs sales must be >= 0"),
    negative_bingo_reason_code: z.string().optional(), // required if sales_bingo < 0

    // Step 3: Cash Count
    denominations: denominationCountSchema,

    // Step 4: Check Logs (array of check entries)
    check_logs: z.array(checkLogInputSchema).default([]),

    // Step 5: Reconciliation (if variance outside tolerance, require note)
    variance_note: z.string().optional(),

    // Notes
    notes: z.string().optional(),

    // Legacy workflow fields (optional, for backward compat)
    workflow_type: z
      .enum(["NORMAL", "NEGATIVE_BINGO_BOX", "RECUPERATION_BOX_RETURN"])
      .optional(),
    beginning_box: z.number().min(0).optional(),
    ending_box: z.number().min(0).optional(),
    bingo_actual: z.number().optional(),
    deposit_actual: z.number().optional(),
  })
  .refine(
    (data) => {
      // If sales_bingo < 0, require reason code
      if (data.sales_bingo < 0 && !data.negative_bingo_reason_code) {
        return false;
      }
      return true;
    },
    {
      message: "negative_bingo_reason_code required when sales_bingo < 0",
      path: ["negative_bingo_reason_code"],
    },
  )
  .refine(
    (data) => {
      // All checks must have both stamps checked
      return data.check_logs.every(
        (check) => check.stamped_on_back && check.phone_dl_written,
      );
    },
    {
      message:
        "All checks must have stamped_on_back and phone_dl_written verified",
      path: ["check_logs"],
    },
  );

export type MicShiftSubmission = z.infer<typeof micShiftSubmissionSchema>;

/**
 * Server-computed response after shift submission
 * This validates the server has done its job (computed all totals)
 */
export const micShiftResponseSchema = z.object({
  id: z.string(),
  date: z.string(),
  shift: z.string(),
  headcount: z.number().int().min(0),
  sales_bingo: z.number(),
  sales_pulltabs: z.number().min(0),
  sales_total: z.number(), // computed: sales_bingo + sales_pulltabs
  cash_total: z.number().min(0), // computed from denominations
  checks_total: z.number().min(0), // computed from check_logs sum
  variance: z.number(), // computed: (cash_total + checks_total) - sales_total
  variance_note: z.string().optional(),
  negative_bingo_reason_code: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "FLAGGED"]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MicShiftResponse = z.infer<typeof micShiftResponseSchema>;
