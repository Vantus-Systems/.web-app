import { defineEventHandler, readBody, createError } from "h3";
import { z } from "zod";
import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

const gameSchema = z.object({
  sortOrder: z.number().int().min(0).max(999),
  title: z.string().min(1).max(255),
  paperColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  notes: z.string().max(1000).optional(),
  patternSlug: z.string().min(1).max(255),
  pricing: z
    .object({
      model: z.enum(["standard", "premium", "included"]).optional(),
      price: z.number().min(0).max(999999).optional(),
      currency: z.string().max(3).optional(),
    })
    .optional(),
  payout: z
    .object({
      type: z
        .enum(["fixed", "percentage", "progressive", "merchandise"])
        .optional(),
      amount: z.number().min(0).max(999999).optional(),
      percentage: z.number().min(0).max(100).optional(),
      description: z.string().max(500).optional(),
      currency: z.string().max(3).optional(),
    })
    .optional(),
  timeline: z
    .object({
      estimatedDuration: z.number().min(1).max(480).optional(),
      isBreak: z.boolean().optional(),
    })
    .optional(),
});

const programSchema = z.object({
  slug: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  games: z.array(gameSchema).max(100),
});

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  let data;
  try {
    data = programSchema.parse(body);
  } catch (validationError: any) {
    throw createError({
      statusCode: 400,
      message: "Validation failed",
      data: {
        errors: validationError.errors?.map((e: any) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
    });
  }

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

    // SQLite/Prisma limitation: createMany doesn't always handle default IDs well
    // Use Promise.all with create instead
    await Promise.all(
      data.games.map((g) =>
        tx.bingoGame.create({
          data: {
            program_id: prog.id,
            sort_order: g.sortOrder,
            title: g.title,
            paperColor: g.paperColor,
            notes: g.notes,
            pattern_id: patternMap.get(g.patternSlug)!,
            pricing_config: JSON.stringify(g.pricing || {}),
            payout_config: JSON.stringify(g.payout || {}),
            timeline_config: JSON.stringify(g.timeline || {}),
          },
        }),
      ),
    );

    return prog;
  });

  // Log comprehensive audit trail
  const after = await prisma.bingoProgram.findUnique({
    where: { slug: data.slug },
    include: { games: true },
  });

  await auditService.log({
    actorUserId: event.context.user.id,
    action: before ? "UPDATE_PROGRAM" : "CREATE_PROGRAM",
    entity: `bingoProgram:${data.slug}`,
    before: before || null,
    after: after || null,
  });

  return {
    success: true,
    slug: result.slug,
    message: before
      ? "Program updated successfully"
      : "Program created successfully",
  };
});
