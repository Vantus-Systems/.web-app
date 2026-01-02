import { randomUUID } from "node:crypto";
import { defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";

export default defineEventHandler(async () => {
  const data = await settingsService.get("jackpot");

  // Default structure
  const defaultStructure = {
    items: [
      {
        id: randomUUID(),
        label: "Bingo Babes Progressive",
        current: 0,
        backup: 0,
        playTime: "Daytime (4 PM)",
        isSession: false,
      },
      {
        id: randomUUID(),
        label: "Progressive Hornet",
        current: 0,
        backup: 0,
        playTime: "Session",
        isSession: true,
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  if (!data) return defaultStructure;

  const d = data as any;

  // Already in the new structure
  if (Array.isArray(d.items)) {
    const normalized = {
      ...d,
      items: (d.items as any[]).map((item) => ({
        ...item,
        id: item?.id || randomUUID(),
      })),
      lastUpdated: d.lastUpdated || new Date().toISOString(),
    };

    // Persist if we had to fill in missing IDs
    const missingId = (d.items as any[]).some((i) => !i?.id);
    if (missingId) {
      await settingsService.set("jackpot", normalized);
    }

    return normalized;
  }

  // Migration from Object Structure { babes: ..., hornet: ... }
  if ("babes" in d && "hornet" in d) {
    const migrated = {
      items: [
        {
          id: randomUUID(),
          label: d.babes?.label || "Bingo Babes Progressive",
          current: Number(d.babes?.current) || 0,
          backup: Number(d.babes?.backup) || 0,
          playTime: "Daytime (4 PM)",
          isSession: false,
        },
        {
          id: randomUUID(),
          label: d.hornet?.label || "Progressive Hornet",
          current: Number(d.hornet?.current) || 0,
          backup: Number(d.hornet?.backup) || 0,
          playTime: "Session",
          isSession: true,
        },
      ],
      lastUpdated: d.lastUpdated || new Date().toISOString(),
    };

    await settingsService.set("jackpot", migrated);
    return migrated;
  }

  // Migration for legacy single-value format
  if ("value" in d) {
    const migrated = {
      items: [
        {
          id: randomUUID(),
          label: "Bingo Babes Progressive",
          current: 0,
          backup: 0,
          playTime: "Daytime (4 PM)",
          isSession: false,
        },
        {
          id: randomUUID(),
          label: "Progressive Hornet",
          current: Number(d.value) || 0,
          backup: 0,
          playTime: "Session",
          isSession: true,
        },
      ],
      lastUpdated: d.lastUpdated || new Date().toISOString(),
    };

    await settingsService.set("jackpot", migrated);
    return migrated;
  }

  // Unknown / corrupt structure — fall back safely
  return defaultStructure;
});
