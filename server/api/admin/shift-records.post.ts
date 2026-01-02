import { defineEventHandler, readBody } from "h3";
import { auditService } from "@server/services/audit.service";
import prisma from "~/server/db/client";
import { assertAnyPermission } from "~/server/utils/permissions";
import { shiftRecordInputSchema } from "~/server/schemas/shift-record.zod";
import { computeShiftTotals } from "~/server/services/shiftRecords.service";

export default defineEventHandler(async (event) => {
  assertAnyPermission(event.context.user?.role, ["mic:edit", "ops:edit"]);

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

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "CREATE_SHIFT",
    entity: `shift:${record.id}`,
    after: record,
  });

  return record;
});
