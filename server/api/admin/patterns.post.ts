import { z } from "zod";
import prisma from "~/server/db/client";
import { auditService } from "~/server/services/audit.service";
import { assertRole } from "~/server/utils/roles";

const frameSchema = z.array(z.number().int().min(0).max(1)).length(25);

const patternSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  isAnimated: z.boolean().default(false),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  activeSessions: z.array(z.string()).optional(),
  definition: z.object({
    frames: z.array(frameSchema).min(1),
    interval: z.number().min(50).max(5000).optional(),
  }),
});

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  const data = patternSchema.parse(body);

  const before = await prisma.bingoPattern.findUnique({
    where: { slug: data.slug },
  });

  const result = await prisma.bingoPattern.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description,
      isAnimated: data.isAnimated,
      definition: JSON.stringify(data.definition),
      category: data.category,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      active_sessions: data.activeSessions
        ? JSON.stringify(data.activeSessions)
        : null,
    },
    create: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      isAnimated: data.isAnimated,
      definition: JSON.stringify(data.definition),
      category: data.category,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      active_sessions: data.activeSessions
        ? JSON.stringify(data.activeSessions)
        : null,
    },
  });

  await auditService.log({
    actorUserId: event.context.user.id,
    action: before ? "UPDATE_PATTERN" : "CREATE_PATTERN",
    entity: `bingoPattern:${data.slug}`,
    before: before
      ? { ...before, definition: JSON.parse(before.definition) }
      : null,
    after: data,
  });

  return {
    ...result,
    definition: JSON.parse(result.definition),
    tags: result.tags ? JSON.parse(result.tags) : [],
    activeSessions: result.active_sessions
      ? JSON.parse(result.active_sessions)
      : [],
  };
});
