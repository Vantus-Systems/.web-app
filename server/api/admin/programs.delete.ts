import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const query = getQuery(event);
  const slug = query.slug as string;

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug is required" });
  }

  const before = await prisma.bingoProgram.findUnique({
    where: { slug },
  });

  if (!before) {
    throw createError({ statusCode: 404, message: "Program not found" });
  }

  await prisma.bingoProgram.delete({
    where: { slug },
  });

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "DELETE_PROGRAM",
    entity: `bingoProgram:${slug}`,
    before,
    after: null,
  });

  return { success: true };
});
