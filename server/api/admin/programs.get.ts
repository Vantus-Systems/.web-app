import { defineEventHandler } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

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
      pricing: g.pricing_config
        ? JSON.parse(g.pricing_config)
        : { model: "included" },
      payout: g.payout_config
        ? JSON.parse(g.payout_config)
        : { type: "fixed", amount: 0 },
      timeline: g.timeline_config
        ? JSON.parse(g.timeline_config)
        : { estimatedDuration: 10, isBreak: false },
    })),
  }));
});
