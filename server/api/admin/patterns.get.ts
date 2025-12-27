import prisma from "~/server/db/client";

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const patterns = await prisma.bingoPattern.findMany({
    orderBy: { name: "asc" },
  });

  return patterns.map((p) => ({
    ...p,
    definition: JSON.parse(p.definition),
  }));
});
