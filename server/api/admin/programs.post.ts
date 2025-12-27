import { z } from "zod";
import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";

const gameSchema = z.object({
  sortOrder: z.number().int().min(0).max(999),
  title: z.string().min(1),
  paperColor: z.string().min(1), // Hex check? "paperColor required"
  notes: z.string().optional(),
  patternSlug: z.string().min(1),
});

const programSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  games: z.array(gameSchema),
});

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const data = programSchema.parse(body);

  // Validate pattern slugs exist
  const patternSlugs = [...new Set(data.games.map((g) => g.patternSlug))];
  const patterns = await prisma.bingoPattern.findMany({
    where: { slug: { in: patternSlugs } },
  });
  if (patterns.length !== patternSlugs.length) {
    const found = new Set(patterns.map((p) => p.slug));
    const missing = patternSlugs.filter((s) => !found.has(s));
    throw createError({
      statusCode: 400,
      message: `Patterns not found: ${missing.join(", ")}`,
    });
  }

  const before = await prisma.bingoProgram.findUnique({
    where: { slug: data.slug },
    include: { games: true },
  });

  const result = await prisma.$transaction(async (tx) => {
    // Upsert Program
    const prog = await tx.bingoProgram.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description,
      },
      create: {
        slug: data.slug,
        name: data.name,
        description: data.description,
      },
    });

    // Delete existing games
    await tx.bingoGame.deleteMany({
      where: { program_id: prog.id },
    });

    // Create new games
    // Need to map patternSlug to patternId
    const patternMap = new Map(patterns.map((p) => [p.slug, p.id]));

    await tx.bingoGame.createMany({
      data: data.games.map((g) => ({
        program_id: prog.id,
        sort_order: g.sortOrder,
        title: g.title,
        paperColor: g.paperColor,
        notes: g.notes,
        pattern_id: patternMap.get(g.patternSlug)!,
      })),
    });

    return prog;
  });

  await auditService.log({
    actorUserId: event.context.user.id,
    action: before ? "UPDATE_PROGRAM" : "CREATE_PROGRAM",
    entity: `bingoProgram:${data.slug}`,
    before: before ? { ...before, games: before.games } : null,
    after: data,
  });

  return { success: true, slug: result.slug };
});
