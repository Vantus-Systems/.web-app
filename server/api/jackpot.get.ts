import { defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";
import { randomUUID } from "node:crypto";

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

  // New Structure
  if (Array.isArray(d.items)) {
    return d;
  }

  // Migration from Object Structure { babes: ..., hornet: ... }
  if ("babes" in d && "hornet" in d) {
    return {
      items: [
        {
          id: randomUUID(),
          label: d.babes.label || "Bingo Babes Progressive",
          current: d.babes.current || 0,
          backup: d.babes.backup || 0,
          playTime: "Daytime (4 PM)",
          isSession: false,
        },
        {
          id: randomUUID(),
          label: d.hornet.label || "Progressive Hornet",
          current: d.hornet.current || 0,
          backup: d.hornet.backup || 0,
          playTime: "Session",
          isSession: true,
        },
      ],
      lastUpdated: d.lastUpdated || new Date().toISOString(),
    };
  }

  // Migration for legacy single-value format
  if ("value" in d) {
    return {
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
  }

  // Fallback for empty object or unrecognizable format
  return defaultStructure;
});
