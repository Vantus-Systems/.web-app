import { defineEventHandler } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";

/**
 * DELETE /api/admin/mic/restricted-players/<id> - Deactivate a restricted player
 * OWNER only
 */
export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID required" });
  }

  await prisma.restrictedPlayer.update({
    where: { id },
    data: { active: false },
  });

  return { success: true };
});
