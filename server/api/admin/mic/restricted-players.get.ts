import { defineEventHandler } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";

/**
 * GET /api/admin/mic/restricted-players - Get all active restricted players
 * OWNER only for management
 */
export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const players = await prisma.restrictedPlayer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return players.map((p) => ({
    id: p.id,
    name: p.name,
    active: p.active,
    notes: p.notes,
    created_at: p.created_at.toISOString(),
    updated_at: p.updated_at.toISOString(),
  }));
});
