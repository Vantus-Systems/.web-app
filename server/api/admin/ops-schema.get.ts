import { createError, defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const [draft, live, history] = await Promise.all([
    settingsService.get("ops_schema_draft"),
    settingsService.get("ops_schema_live"),
    settingsService.get("ops_schema_history"),
  ]);

  const historyMeta = Array.isArray(history)
    ? history.map((entry: any) => ({
        id: entry?.id,
        profile_name: entry?.schema?.meta?.name,
        published_at: entry?.published_at,
      }))
    : [];

  return {
    draft: draft || null,
    live: live || null,
    historyMeta,
  };
});
