import prisma from "~/server/db/client";

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const programs = await prisma.bingoProgram.findMany({
    orderBy: { name: "asc" },
    include: {
      games: {
        orderBy: { sort_order: "asc" },
        include: {
          pattern: true,
        },
      },
    },
  });

  return programs.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    games: p.games.map((g) => ({
      id: g.id,
      sortOrder: g.sort_order,
      title: g.title,
      paperColor: g.paperColor,
      notes: g.notes,
      patternSlug: g.pattern.slug,
      pattern: {
        name: g.pattern.name,
        definition: JSON.parse(g.pattern.definition),
      },
    })),
  }));
});
