import { defineEventHandler, getQuery } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";
import { shiftRecordQuerySchema } from "~/server/schemas/shift-record.zod";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER", "MIC"]);

  const query = shiftRecordQuerySchema.parse(getQuery(event));
  const where: Record<string, any> = { is_deleted: false };
  if (query.start || query.end) {
    where.date = {};
    if (query.start) where.date.gte = new Date(`${query.start}T00:00:00Z`);
    if (query.end) where.date.lte = new Date(`${query.end}T23:59:59Z`);
  }
  if (query.userId) {
    where.created_by_user_id = query.userId;
  }

  const shifts = await prisma.shiftRecord.findMany({
    where,
    orderBy: [{ date: "desc" }, { shift: "desc" }],
    include: {
      created_by: {
        select: { id: true, username: true, first_name: true, last_name: true },
      },
      prev_shift: true,
    },
  });

  return shifts;
});
