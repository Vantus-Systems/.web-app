import { defineEventHandler, createError, readBody } from "h3";
import { auditService } from "@server/services/audit.service";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";
import { shiftRecordUpdateSchema } from "~/server/schemas/shift-record.zod";
import { computeShiftTotals } from "~/server/services/shiftRecords.service";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER", "MIC"]);

  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, message: "Missing shift id" });
  }

  const body = await readBody(event);
  const data = shiftRecordUpdateSchema.parse(body);

  const existing = await prisma.shiftRecord.findUnique({ where: { id } });
  if (!existing || existing.is_deleted) {
    throw createError({ statusCode: 404, message: "Shift not found" });
  }

  const merged = {
    date: data.date ?? existing.date.toISOString().slice(0, 10),
    shift: data.shift ?? existing.shift,
    pulltabs_total: data.pulltabs_total ?? existing.pulltabs_total,
    deposit_total: data.deposit_total ?? existing.deposit_total,
    workflow_type: data.workflow_type ?? existing.workflow_type,
    beginning_box: data.beginning_box ?? existing.beginning_box ?? undefined,
    ending_box: data.ending_box ?? existing.ending_box ?? undefined,
    bingo_actual: data.bingo_actual ?? existing.bingo_actual ?? undefined,
    prev_shift_id: data.prev_shift_id ?? existing.prev_shift_id ?? undefined,
  };

  const { prevShift, beginningBox, depositTotal, bingoTotal } =
    await computeShiftTotals(merged as any);

  const record = await prisma.shiftRecord.update({
    where: { id },
    data: {
      date: new Date(`${merged.date}T00:00:00Z`),
      shift: merged.shift,
      pulltabs_total: merged.pulltabs_total,
      deposit_total: depositTotal ?? 0,
      bingo_total: bingoTotal,
      players: data.players ?? existing.players,
      workflow_type: merged.workflow_type,
      beginning_box: beginningBox,
      ending_box: data.ending_box ?? existing.ending_box,
      bingo_actual: data.bingo_actual ?? existing.bingo_actual,
      deposit_actual: data.deposit_actual ?? existing.deposit_actual,
      notes: data.notes ?? existing.notes,
      prev_shift_id:
        data.prev_shift_id ?? prevShift?.id ?? existing.prev_shift_id,
    },
  });

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_SHIFT",
    entity: `shift:${record.id}`,
    before: existing,
    after: record,
  });

  return record;
});
