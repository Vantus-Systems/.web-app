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
  let currentState: any = defaultStructure;

  // New Structure (preferred)
  if (Array.isArray(d.items)) {
    currentState = d;
  }

  // Migration from Object Structure { babes: ..., hornet: ... }
  else if ("babes" in d && "hornet" in d) {
    currentState = {
      items: [
        {
          id: randomUUID(),
          label: d.babes.label || "Bingo Babes Progressive",
          current: d.babes.current || 0,
          backup: d.babes.backup || 0,
          playTime: "Daytime (4 PM)",
          isSession: false,
          lastWonDate: d.babes.lastWonDate || undefined,
        },
        {
          id: randomUUID(),
          label: d.hornet.label || "Progressive Hornet",
          current: d.hornet.current || 0,
          backup: d.hornet.backup || 0,
          playTime: "Session",
          isSession: true,
          lastWonDate: d.hornet.lastWonDate || undefined,
        },
      ],
      lastUpdated: d.lastUpdated || new Date().toISOString(),
      lastDailyUpdate: d.lastDailyUpdate || undefined,
    };
  }

  // Migration for legacy single-value format
  else if ("value" in d) {
    currentState = {
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
      lastDailyUpdate: d.lastDailyUpdate || undefined,
    };
  }

  // --- Auto-Increment Logic ---
  const now = new Date();
  // Central Time Check (Approximate or use server local if configured, assuming server is local or UTC)
  // User said "4:15 PM Daily... update at 5:00 PM".
  // Assuming server time matches or we use offsets.
  // Ideally use timezone aware logic.
  // For simplicity, checking hour >= 17.

  const todayStr = now.toISOString().slice(0, 10);
  const lastDailyUpdate = (currentState as any).lastDailyUpdate || "";

  // If we haven't updated TODAY, and it's past 5 PM (17:00)
  if (now.getHours() >= 17 && lastDailyUpdate !== todayStr) {
    let changed = false;

    const items = Array.isArray(currentState.items) ? currentState.items : [];

    // "update ... if it is not won"
    for (const item of items) {
      const lastWonDate = String((item as any).lastWonDate || "");
      if (lastWonDate === todayStr) continue;

      // Apply same $5,000 cap behavior consistently.
      if (Number(item.current || 0) >= 5000) {
        item.backup = Number(item.backup || 0) + 100;
      } else {
        item.current = Number(item.current || 0) + 100;
      }

      changed = true;
    }

    if (changed) {
      (currentState as any).lastDailyUpdate = todayStr;
      currentState.lastUpdated = now.toISOString();
      await settingsService.set("jackpot", currentState);
    }
  }

  return currentState;
});
