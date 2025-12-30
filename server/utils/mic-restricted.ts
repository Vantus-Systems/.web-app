/**
 * Restricted Player Checking
 * Used to block checks from restricted players
 */

import prisma from "~/server/db/client";

/**
 * Search for restricted players by name (case-insensitive partial match)
 */
export async function searchRestrictedPlayers(query: string): Promise<
  Array<{
    id: string;
    name: string;
    active: boolean;
    notes?: string | null;
  }>
> {
  const results = await prisma.restrictedPlayer.findMany({
    where: {
      active: true,
      name: {
        contains: query,
      },
    },
    select: {
      id: true,
      name: true,
      active: true,
      notes: true,
    },
  });
  return results;
}

/**
 * Check if a player name matches a restricted player
 * Used during check verification
 */
export async function isPlayerRestricted(playerName: string): Promise<{
  isRestricted: boolean;
  restrictedPlayer?: {
    id: string;
    name: string;
    notes?: string | null;
  };
}> {
  const match = await prisma.restrictedPlayer.findFirst({
    where: {
      active: true,
      name: {
        equals: playerName,
      },
    },
    select: {
      id: true,
      name: true,
      notes: true,
    },
  });

  if (match) {
    return {
      isRestricted: true,
      restrictedPlayer: match,
    };
  }

  return {
    isRestricted: false,
  };
}

/**
 * Get all active restricted players
 */
export async function getAllRestrictedPlayers() {
  return await prisma.restrictedPlayer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}
