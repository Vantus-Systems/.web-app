import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";
import { shiftRecordInputSchema } from "~/server/schemas/shift-record.zod";
import { computeShiftTotals } from "~/server/services/shiftRecords.service";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER", "MIC"]);

  const body = await readBody(event);
  const data = shiftRecordInputSchema.parse(body);

  const { prevShift, beginningBox, depositTotal, bingoTotal } =
    await computeShiftTotals({
      date: data.date,
      shift: data.shift,
      pulltabs_total: data.pulltabs_total,
      deposit_total: data.deposit_total,
      workflow_type: data.workflow_type,
      beginning_box: data.beginning_box,
      ending_box: data.ending_box,
      bingo_actual: data.bingo_actual,
      prev_shift_id: data.prev_shift_id,
    });

  const record = await prisma.shiftRecord.create({
    data: {
      date: new Date(`${data.date}T00:00:00Z`),
      shift: data.shift,
      pulltabs_total: data.pulltabs_total,
      deposit_total: depositTotal ?? 0,
      bingo_total: bingoTotal,
      players: data.players,
      workflow_type: data.workflow_type,
      beginning_box: beginningBox,
      ending_box: data.ending_box,
      bingo_actual: data.bingo_actual,
      deposit_actual: data.deposit_actual,
      notes: data.notes,
      prev_shift_id: data.prev_shift_id ?? prevShift?.id,
      created_by_user_id: event.context.user.id,
    },
  });

  return record;
});
