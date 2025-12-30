import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";
import { restrictedPlayerCreateSchema } from "~/server/schemas/restrictedPlayer.zod";

/**
 * POST /api/admin/mic/restricted-players - Create a new restricted player entry
 * OWNER only
 */
export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  const data = restrictedPlayerCreateSchema.parse(body);

  const player = await prisma.restrictedPlayer.create({
    data: {
      name: data.name,
      notes: data.notes || null,
      active: data.active,
    },
  });

  return {
    id: player.id,
    name: player.name,
    active: player.active,
    notes: player.notes,
    created_at: player.created_at.toISOString(),
    updated_at: player.updated_at.toISOString(),
  };
});
