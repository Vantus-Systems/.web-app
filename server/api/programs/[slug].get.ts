import { defineEventHandler, getRouterParam, createError } from "h3";
import prisma from "~/server/db/client";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug is required",
    });
  }

  const program = await prisma.bingoProgram.findUnique({
    where: { slug },
    include: {
      games: {
        orderBy: { sort_order: "asc" },
        include: {
          pattern: true,
        },
      },
    },
  });

  if (!program) {
    throw createError({
      statusCode: 404,
      statusMessage: "Program not found",
    });
  }

  return {
    slug: program.slug,
    name: program.name,
    description: program.description,
    games: program.games.map((g) => ({
      sortOrder: g.sort_order,
      title: g.title,
      paperColor: g.paperColor,
      notes: g.notes,
      pattern: {
        slug: g.pattern.slug,
        name: g.pattern.name,
        description: g.pattern.description,
        isAnimated: g.pattern.isAnimated,
        definition: JSON.parse(g.pattern.definition),
      },
    })),
  };
});
