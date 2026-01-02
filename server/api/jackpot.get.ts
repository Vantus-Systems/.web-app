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
  let needsPersistence = false;

  const ensureItemIds = (state: any) => {
    if (!state || !Array.isArray(state.items)) return false;
    let added = false;
    state.items = (state.items as any[]).map((item) => {
      if (item?.id) return item;
      added = true;
      return { ...item, id: randomUUID() };
    });
    return added;
  };

  // Migration logic

  // Case 1: Already in the new structure
  if (Array.isArray(d.items)) {
    currentState = d;
    // We still check if IDs are missing later
  }
  // Case 2: Migration from Object Structure { babes: ..., hornet: ... }
  else if ("babes" in d && "hornet" in d) {
    currentState = {
      items: [
        {
          id: randomUUID(),
          label: d.babes?.label || "Bingo Babes Progressive",
          current: Number(d.babes?.current) || 0,
          backup: Number(d.babes?.backup) || 0,
          playTime: "Daytime (4 PM)",
          isSession: false,
          lastWonDate: d.babes.lastWonDate || undefined,
        },
        {
          id: randomUUID(),
          label: d.hornet?.label || "Progressive Hornet",
          current: Number(d.hornet?.current) || 0,
          backup: Number(d.hornet?.backup) || 0,
          playTime: "Session",
          isSession: true,
          lastWonDate: d.hornet.lastWonDate || undefined,
        },
      ],
      lastUpdated: d.lastUpdated || new Date().toISOString(),
      lastDailyUpdate: d.lastDailyUpdate || undefined,
    };
    needsPersistence = true;
  }
  // Case 3: Migration for legacy single-value format
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
  }
  // Case 4: Unknown structure
  else {
    currentState = defaultStructure;
    needsPersistence = true;
  }

  const missingIds = ensureItemIds(currentState);
  if (missingIds) {
    needsPersistence = true;
  }

  // --- Auto-Increment Logic ---
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const lastDailyUpdate = (currentState as any).lastDailyUpdate || "";
  let autopRunTriggered = false;
  let autopChange = false;

  // Assuming server time is roughly what we want, or we accept this limitation.
  if (now.getHours() >= 17 && lastDailyUpdate !== todayStr) {
    autopRunTriggered = true;
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

      autopChange = true;
    }

    (currentState as any).lastDailyUpdate = todayStr;
    if (autopChange) {
      currentState.lastUpdated = now.toISOString();
    }
  }

  if (needsPersistence || autopRunTriggered) {
    await settingsService.set("jackpot", currentState);
  }

  return currentState;
});
