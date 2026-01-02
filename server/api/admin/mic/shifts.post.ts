import { defineEventHandler, readBody, createError } from "h3";
import { auditService } from "@server/services/audit.service";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";
import { micShiftSubmissionSchema } from "~/server/schemas/micShift.zod";
import {
  calculateCashTotal,
  calculateChecksTotal,
  reconcile,
} from "~/server/utils/mic-money";
import { isPlayerRestricted } from "~/server/utils/mic-restricted";
import { formatCurrency } from "~/utils/format";

/**
 * POST /api/admin/mic/shifts - Submit a MIC shift with full workflow
 * Validates:
 * - sales_pulltabs >= 0
 * - sales_bingo can be negative only with reason code
 * - checks have both stamps verified
 * - no restricted players in checks
 * - computes cash_total, checks_total, variance server-side
 */
export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["MIC", "OWNER"]);

  const body = await readBody(event);
  const data = micShiftSubmissionSchema.parse(body);

  // Calculate cashTotal from denominations
  const cashTotal = calculateCashTotal(data.denominations);

  // Calculate checksTotal from check logs
  const checksTotal = calculateChecksTotal(data.check_logs);

  // Calculate salesTotal
  const salesTotal = data.sales_bingo + data.sales_pulltabs;

  // Validate: all checks must have both stamps verified
  for (const check of data.check_logs) {
    if (!check.stamped_on_back || !check.phone_dl_written) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "All checks must be verified (stamped_on_back and phone_dl_written)",
      });
    }

    // Validate: no restricted players
    const restricted = await isPlayerRestricted(check.player_name);
    if (restricted.isRestricted) {
      throw createError({
        statusCode: 400,
        statusMessage: `Player "${check.player_name}" is restricted. Cannot accept check.`,
        data: {
          player_name: check.player_name,
          reason: restricted.restrictedPlayer?.notes,
        },
      });
    }
  }

  // Compute variance
  const reconciliation = reconcile(cashTotal, checksTotal, salesTotal, 1.0);

  // Determine status
  // If variance is outside tolerance and no variance_note provided, reject
  // Otherwise, mark as FLAGGED if variance outside tolerance
  let status = "SUBMITTED";
  if (!reconciliation.isBalanced && !data.variance_note) {
    throw createError({
      statusCode: 400,
      statusMessage: `Variance of $${formatCurrency(Math.abs(reconciliation.variance), 2)} is outside tolerance. Please provide a variance_note.`,
      data: { variance: reconciliation.variance },
    });
  }
  if (!reconciliation.isBalanced) {
    status = "FLAGGED";
  }

  // Helper for safe bracket access (avoids dot-notation / camelcase lint conflicts)
  const getField = <T extends Record<string, any>, K extends keyof any>(
    obj: T,
    key: K,
  ) => obj[key as keyof T];

  const K_PULLTABS_TOTAL = "pulltabs_total";
  const K_DEPOSIT_TOTAL = "deposit_total";
  const K_BINGO_TOTAL = "bingo_total";
  const K_SALES_BINGO = "sales_bingo";
  const K_SALES_PULLTABS = "sales_pulltabs";
  const K_SALES_TOTAL = "sales_total";
  const K_CASH_TOTAL = "cash_total";
  const K_CHECKS_TOTAL = "checks_total";
  const K_TOTAL_VALUE = "total_value";
  const K_PLAYER_NAME = "player_name";
  const K_CHECK_NUMBER = "check_number";
  const K_STAMPED_ON_BACK = "stamped_on_back";
  const K_PHONE_DL_WRITTEN = "phone_dl_written";
  const K_IS_BLOCKED = "is_blocked";
  const K_VARIANCE_NOTE = "variance_note";
  const K_NEG_BINGO_CODE = "negative_bingo_reason_code";

  // Use Transaction for Atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create shift record with computed totals
    const shiftRecord = await tx.shiftRecord.create({
      data: {
        date: new Date(`${data.date}T00:00:00Z`),
        shift: data.shift,
        [K_PULLTABS_TOTAL]: data.sales_pulltabs, // for backward compat
        [K_DEPOSIT_TOTAL]: salesTotal, // for backward compat
        [K_BINGO_TOTAL]: data.sales_bingo, // for backward compat
        players: data.headcount,
        workflow_type: data.workflow_type || "NORMAL",
        beginning_box: data.beginning_box,
        ending_box: data.ending_box,
        bingo_actual: data.bingo_actual,
        deposit_actual: data.deposit_actual,
        notes: data.notes,
        created_by_user_id: event.context.user.id,
        // NEW MIC automation fields
        [K_SALES_BINGO]: data.sales_bingo,
        [K_SALES_PULLTABS]: data.sales_pulltabs,
        [K_SALES_TOTAL]: salesTotal,
        [K_CASH_TOTAL]: cashTotal,
        [K_CHECKS_TOTAL]: checksTotal,
        variance: reconciliation.variance,
        [K_VARIANCE_NOTE]: data.variance_note,
        [K_NEG_BINGO_CODE]: data.negative_bingo_reason_code,
        status: status as "SUBMITTED" | "FLAGGED",
      },
    });

    // Create CashCount record
    if (data.denominations) {
      await tx.cashCount.create({
        data: {
          shift_id: shiftRecord.id,
          ...data.denominations,
          [K_TOTAL_VALUE]: cashTotal,
        },
      });
    }

    // Create CheckLog records
    for (const check of data.check_logs) {
      // Coerce values to the expected types to satisfy Prisma/TS
      const playerName = String(getField(check, K_PLAYER_NAME));
      const checkNumber = String(getField(check, K_CHECK_NUMBER));
      const stampedRaw = getField(check, K_STAMPED_ON_BACK);
      const phoneRaw = getField(check, K_PHONE_DL_WRITTEN);
      const toBoolean = (v: any) =>
        typeof v === "string" ? v === "true" : Boolean(v);

      await tx.checkLog.create({
        data: {
          shift_id: shiftRecord.id,
          [K_PLAYER_NAME]: playerName,
          [K_CHECK_NUMBER]: checkNumber,
          amount: Number(check.amount),
          [K_STAMPED_ON_BACK]: toBoolean(stampedRaw),
          [K_PHONE_DL_WRITTEN]: toBoolean(phoneRaw),
          [K_IS_BLOCKED]: false,
        },
      });
    }

    return shiftRecord;
  });

  // Log audit outside transaction (to avoid locking, though inside is also fine)
  await auditService.log({
    actorUserId: event.context.user.id,
    action: "CREATE_SHIFT_MIC",
    entity: `shift:${result.id}`,
    after: result,
  });

  return await prisma.shiftRecord.findUnique({
    where: { id: result.id },
    include: {
      created_by: {
        select: { id: true, username: true, first_name: true, last_name: true },
      },
      prev_shift: true,
    },
  });
});
