import { randomUUID } from "node:crypto";
import { defineEventHandler } from "h3";
import { settingsService } from "@server/services/settings.service";

// Define interfaces for type safety
interface JackpotItem {
  id: string;
  label: string;
  current: number;
  backup: number;
  playTime: string;
  isSession: boolean;
  lastWonDate?: string;
}

interface JackpotState {
  items: JackpotItem[];
  lastUpdated: string;
  lastDailyUpdate?: string;
}

export default defineEventHandler(async () => {
  const data = await settingsService.get("jackpot");

  // Default structure
  const defaultStructure: JackpotState = {
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
  let currentState: JackpotState = defaultStructure;
  let needsPersistence = false;

  // Helper to ensure IDs exist
  const ensureItemIds = (items: any[]) => {
    let added = false;
    const newItems = items.map((item) => {
      if (item && item.id) return item;
      added = true;
      return { ...item, id: randomUUID() };
    });
    return { added, items: newItems };
  };

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
          label: babes.label || "Bingo Babes Progressive",
          current: Number(babes.current) || 0,
          backup: Number(babes.backup) || 0,
          playTime: "Daytime (4 PM)",
          isSession: false,
          lastWonDate: babes.lastWonDate || undefined,
        },
        {
          id: randomUUID(),
          label: hornet.label || "Progressive Hornet",
          current: Number(hornet.current) || 0,
          backup: Number(hornet.backup) || 0,
          playTime: "Session",
          isSession: true,
          lastWonDate: hornet.lastWonDate || undefined,
        },
      ],
      lastUpdated: d.lastUpdated || new Date().toISOString(),
      lastDailyUpdate: d.lastDailyUpdate || undefined,
    };
    needsPersistence = true;
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
    needsPersistence = true;
  } else {
    // Case 4: Unknown structure
    currentState = defaultStructure;
    needsPersistence = true;
  }

  // Ensure IDs
  if (currentState.items && Array.isArray(currentState.items)) {
    const { added, items } = ensureItemIds(currentState.items);
    if (added) {
      currentState.items = items as JackpotItem[];
      needsPersistence = true;
    }
  } else {
    // Should not happen if migration logic is correct, but safe fallback
    currentState.items = defaultStructure.items;
    needsPersistence = true;
  }

  // --- Auto-Increment Logic ---
  const now = new Date();
  // Central Time Check (Approximate or use server local if configured, assuming server is local or UTC)
  // For simplicity, checking hour >= 17.

  const todayStr = now.toISOString().slice(0, 10);
  const lastDailyUpdate = currentState.lastDailyUpdate || "";
  let autopRunTriggered = false;
  let autopChange = false;

  // Assuming server time is roughly what we want
  if (now.getHours() >= 17 && lastDailyUpdate !== todayStr) {
    autopRunTriggered = true;

    // "update ... if it is not won"
    for (const item of currentState.items) {
      const lastWonDate = item.lastWonDate || "";
      if (lastWonDate === todayStr) continue;

      // Apply same $5,000 cap behavior consistently.
      if (Number(item.current || 0) >= 5000) {
        item.backup = Number(item.backup || 0) + 100;
      } else {
        item.current = Number(item.current || 0) + 100;
      }

      autopChange = true;
    }

    currentState.lastDailyUpdate = todayStr;
    if (autopChange) {
      currentState.lastUpdated = now.toISOString();
    }
  }

  if (needsPersistence || autopRunTriggered) {
    await settingsService.set("jackpot", currentState);
  }

  return currentState;
});
