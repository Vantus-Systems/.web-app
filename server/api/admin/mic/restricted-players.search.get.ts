import { defineEventHandler, getQuery } from "h3";
import { assertRole } from "~/server/utils/roles";
import { searchRestrictedPlayers } from "~/server/utils/mic-restricted";

/**
 * GET /api/admin/mic/restricted-players/search?query=<name>
 * Search for restricted players by name (debounced during check verification)
 */
export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["MIC", "OWNER"]);

  const query = getQuery(event);
  const searchQuery = query.query as string;

  if (!searchQuery || searchQuery.length < 1) {
    return [];
  }

  const results = await searchRestrictedPlayers(searchQuery);
  return results;
});
