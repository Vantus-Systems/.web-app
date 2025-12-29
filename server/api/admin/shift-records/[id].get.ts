import { defineEventHandler, createError } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER", "MIC"]);

  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, message: "Missing shift id" });
  }

  const record = await prisma.shiftRecord.findUnique({
    where: { id },
    include: {
      created_by: {
        select: { id: true, username: true, first_name: true, last_name: true },
      },
      prev_shift: true,
    },
  });
  if (!record || record.is_deleted) {
    throw createError({ statusCode: 404, message: "Shift not found" });
  }

  return record;
});
