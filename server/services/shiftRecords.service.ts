import { createError } from "h3";
import type {
  ShiftWorkflowType,
  ShiftDesignation,
} from "~/server/schemas/shift-record.zod";
import prisma from "~/server/db/client";

const toDate = (date: string) => new Date(`${date}T00:00:00Z`);

export const findPreviousShift = async (
  date: string,
  shift: ShiftDesignation,
) => {
  const targetDate = toDate(date);
  const where =
    shift === "PM"
      ? {
          is_deleted: false,
          OR: [{ date: { lt: targetDate } }, { date: targetDate, shift: "AM" }],
        }
      : {
          is_deleted: false,
          date: { lt: targetDate },
        };

  return await prisma.shiftRecord.findFirst({
    where,
    orderBy: [{ date: "desc" }, { shift: "desc" }],
  });
};

export const computeShiftTotals = async (input: {
  date: string;
  shift: ShiftDesignation;
  pulltabs_total: number;
  deposit_total?: number;
  workflow_type: ShiftWorkflowType;
  beginning_box?: number;
  ending_box?: number;
  bingo_actual?: number;
  deposit_actual?: number;
  prev_shift_id?: string;
}) => {
  const payload = { ...input };
  let prevShift = null;

  if (payload.prev_shift_id) {
    prevShift = await prisma.shiftRecord.findUnique({
      where: { id: payload.prev_shift_id },
    });
  } else {
    prevShift = await findPreviousShift(payload.date, payload.shift);
  }

  // Resolution: Beginning Box
  let beginningBox = payload.beginning_box;
  if (beginningBox === undefined || beginningBox === null) {
    if (payload.workflow_type === "RECUPERATION_BOX_RETURN") {
      // For recuperation, default to previous shift ending box if current start is missing
      if (
        prevShift?.ending_box !== null &&
        prevShift?.ending_box !== undefined
      ) {
        beginningBox = prevShift.ending_box;
      }
    } else if (payload.workflow_type === "NORMAL") {
      beginningBox = 4000; // Default anchor
    }
  }
  // Fallback for calculation safety
  const startBox = beginningBox ?? 4000;
  const endBox = payload.ending_box ?? startBox;

  // Derived 1: Box Delta
  const boxDelta = endBox - startBox;

  // Resolution: Deposit Total
  // For NEGATIVE_BINGO_BOX, if deposit is missing, it defaults to pulltabs (assuming 0 bingo deposit)
  let depositTotalInput = payload.deposit_total;
  if (depositTotalInput === undefined || depositTotalInput === null) {
    if (payload.workflow_type === "NEGATIVE_BINGO_BOX") {
      depositTotalInput = payload.pulltabs_total;
    } else {
      // For NORMAL/RECUPERATION, ideally required, but default to pulltabs (0 bingo) if missing to avoid NaN
      depositTotalInput = payload.pulltabs_total;
    }
  }

  // Derived 2: Bingo Deposited
  const bingoDeposited = depositTotalInput - payload.pulltabs_total;

  // Derived 3: Actuals (Accounting Rules)
  // bingo_actual = bingo_deposited + box_delta
  // deposit_actual = deposit_total + box_delta
  const computedBingoActual = bingoDeposited + boxDelta;
  const computedDepositActual = depositTotalInput + boxDelta;

  const bingoActual = payload.bingo_actual ?? computedBingoActual;
  const depositActual = payload.deposit_actual ?? computedDepositActual;

  // Derived 4: Bingo Total (Stored for Logs/UI)
  // NORMAL / RECUPERATION: bingo_total = bingo_deposited
  // NEGATIVE_BINGO_BOX: bingo_total = box_delta
  let bingoTotal = 0;
  if (payload.workflow_type === "NEGATIVE_BINGO_BOX") {
    bingoTotal = boxDelta;
  } else {
    bingoTotal = bingoDeposited;
  }

  // Validation: Ending box cap
  if (payload.ending_box !== undefined && payload.ending_box > 4000) {
    throw createError({
      statusCode: 400,
      message: "Ending box cannot exceed 4000.",
    });
  }

  return {
    prevShift,
    beginningBox,
    depositTotal: depositTotalInput,
    bingoTotal,
    bingoActual,
    depositActual,
  };
};
