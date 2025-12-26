import { defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";

export default defineEventHandler(async () => {
  const data = await settingsService.get("jackpot");

  // Default structure
  const defaultStructure = {
    babes: { current: 0, backup: 0, label: "Bingo Babes Progressive" },
    hornet: { current: 0, backup: 0, label: "Progressive Hornet" },
    lastUpdated: new Date().toISOString(),
  };

  if (!data) return defaultStructure;

  const d = data as any;

  // If already has new structure
  if ('babes' in d && 'hornet' in d) {
      return d;
  }

  // Migration for legacy single-value format
  // Old format: { value: number, lastUpdated: string }
  if ('value' in d) {
    return {
      babes: { current: 0, backup: 0, label: "Bingo Babes Progressive" },
      hornet: {
        current: Number(d.value) || 0,
        backup: 0,
        label: "Progressive Hornet",
      },
      lastUpdated: d.lastUpdated || new Date().toISOString(),
    };
  }

  // Fallback for empty object or unrecognizable format
  return defaultStructure;
});
