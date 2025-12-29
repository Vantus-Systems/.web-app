import { z } from "zod";
import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const query = getQuery(event);
  const slug = query.slug as string;

  if (!slug) {
    throw createError({ statusCode: 400, message: "Slug is required" });
  }

  const before = await prisma.bingoPattern.findUnique({
    where: { slug },
  });

  if (!before) {
    throw createError({ statusCode: 404, message: "Pattern not found" });
  }

  const usageCount = await prisma.bingoGame.count({
    where: { pattern_id: before.id },
  });

  if (usageCount > 0) {
    throw createError({
      statusCode: 409,
      message:
        "Pattern is assigned to existing programs. Remove it from programs before deleting.",
    });
  }

  await prisma.bingoPattern.delete({
    where: { slug },
  });

  await auditService.log({
    actorUserId: event.context.user.id,
    action: "DELETE_PATTERN",
    entity: `bingoPattern:${slug}`,
    before: { ...before, definition: JSON.parse(before.definition) },
    after: null,
  });

  return { success: true };
});
