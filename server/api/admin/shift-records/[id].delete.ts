import { defineEventHandler, createError } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER", "MIC"]);

  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, message: "Missing shift id" });
  }

  const existing = await prisma.shiftRecord.findUnique({ where: { id } });
  if (!existing || existing.is_deleted) {
    throw createError({ statusCode: 404, message: "Shift not found" });
  }

  await prisma.shiftRecord.update({
    where: { id },
    data: { is_deleted: true },
  });

  return { success: true };
});
