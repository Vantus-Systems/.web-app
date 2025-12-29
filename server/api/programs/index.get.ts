import prisma from "~/server/db/client";

export default defineEventHandler(async (_event) => {
  const programs = await prisma.bingoProgram.findMany({
    include: {
      _count: {
        select: { games: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return programs.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    gameCount: p._count.games,
  }));
});
