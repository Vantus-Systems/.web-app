import { defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";
import { homepageSchema } from "@server/schemas/homepage";

export default defineEventHandler(async () => {
  const settings = await settingsService.get("homepage");

  // Return parsed settings or default if not found/invalid
  if (!settings) {
    return homepageSchema.parse({
      hero: {},
      ticker: { items: [] },
      statsBar: { items: [] },
      prizePool: {},
      winners: { items: [] },
      mission: {},
    });
  }

  return settings;
});
