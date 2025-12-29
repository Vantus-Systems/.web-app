import { defineEventHandler, createError, readBody } from "h3";
import prisma from "@server/db/client";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    throw createError({ statusCode: 400, message: "Missing id" });
  }

  // Prevent deleting self?
  if (id === event.context.user.id) {
    throw createError({ statusCode: 400, message: "Cannot delete yourself" });
  }

  await prisma.user.delete({
    where: { id },
  });

  return { success: true };
});
