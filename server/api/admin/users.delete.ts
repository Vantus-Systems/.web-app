import { defineEventHandler, createError, readBody } from "h3";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "@server/db/client";
import { assertRole } from "~/server/utils/roles";

const deleteUserSchema = z.object({
  id: z.string().uuid(),
});

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const { id } = deleteUserSchema.parse(await readBody(event));

  const currentUserId = event.context.user?.id;
  if (!currentUserId) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized user context",
    });
  }

  // Prevent deleting self?
  if (id === currentUserId) {
    throw createError({ statusCode: 400, message: "Cannot delete yourself" });
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    // Audit log
    await auditService.log({
      actorUserId: event.context.user.id,
      action: "DELETE_USER",
      entity: `user:${deletedUser.id}`,
      before: {
        username: deletedUser.username,
        role: deletedUser.role,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw createError({ statusCode: 404, message: "User not found" });
    }
    throw error;
  }

  return { success: true };
});
