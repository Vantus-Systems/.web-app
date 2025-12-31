import { defineEventHandler } from "h3";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const patterns = await prisma.bingoPattern.findMany({
    orderBy: { name: "asc" },
  });

  return patterns.map((p) => ({
    ...p,
    definition: JSON.parse(p.definition),
    tags: p.tags ? JSON.parse(p.tags) : [],
    activeSessions: p.active_sessions ? JSON.parse(p.active_sessions) : [],
  }));
});
