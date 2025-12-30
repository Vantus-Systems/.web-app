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
  prev_shift_id?: string;
}) => {
  const payload = { ...input };
  let prevShift = null;

  if (payload.prev_shift_id) {
    prevShift = await prisma.shiftRecord.findUnique({
      where: { id: payload.prev_shift_id },
    });
    if (!prevShift) {
      throw createError({
        statusCode: 400,
        message: "Previous shift not found.",
      });
    }
  } else {
    prevShift = await findPreviousShift(payload.date, payload.shift);
  }

  let beginningBox = payload.beginning_box;
  let depositTotal = payload.deposit_total ?? null;
  let bingoTotal = 0;

  if (payload.workflow_type === "NORMAL") {
    if (depositTotal === null) {
      throw createError({
        statusCode: 400,
        message: "Deposit is required for normal shifts.",
      });
    }
    bingoTotal = depositTotal - payload.pulltabs_total;
  }

  if (payload.workflow_type === "NEGATIVE_BINGO_BOX") {
    if (
      payload.beginning_box === undefined ||
      payload.ending_box === undefined
    ) {
      throw createError({
        statusCode: 400,
        message: "Beginning and ending box are required for negative bingo.",
      });
    }
    beginningBox = payload.beginning_box;
    depositTotal = payload.pulltabs_total;
    bingoTotal = payload.ending_box - payload.beginning_box;
  }

  if (payload.workflow_type === "RECUPERATION_BOX_RETURN") {
    if (!prevShift) {
      throw createError({
        statusCode: 400,
        message: "Recuperation shifts must reference a previous shift.",
      });
    }
    if (!beginningBox) {
      if (
        prevShift?.ending_box === null ||
        prevShift?.ending_box === undefined
      ) {
        throw createError({
          statusCode: 400,
          message:
            "Previous shift with ending box is required for recuperation.",
        });
      }
      beginningBox = prevShift.ending_box;
    }
    if (payload.ending_box === undefined) {
      throw createError({
        statusCode: 400,
        message: "Ending box is required for recuperation.",
      });
    }
    if (payload.bingo_actual !== undefined) {
      bingoTotal = payload.bingo_actual;
      depositTotal = payload.pulltabs_total + payload.bingo_actual;
    } else if (depositTotal !== null) {
      bingoTotal = depositTotal - payload.pulltabs_total;
    } else {
      throw createError({
        statusCode: 400,
        message: "Provide bingo actual or deposit for recuperation.",
      });
    }
  }

  if (payload.ending_box !== undefined && payload.ending_box > 4000) {
    throw createError({
      statusCode: 400,
      message: "Ending box cannot exceed 4000.",
    });
  }

  return {
    prevShift,
    beginningBox,
    depositTotal,
    bingoTotal,
  };
};
