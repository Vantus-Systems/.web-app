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
    // Keep the structure but ensure we have lastUpdated/lastDailyUpdate fields present
    currentState = {
      items: d.items,
      lastUpdated: d.lastUpdated || new Date().toISOString(),
      lastDailyUpdate: d.lastDailyUpdate || undefined,
    } as JackpotState;
  }
  // Migration from Object Structure { babes: ..., hornet: ... }
  else if ("babes" in d && "hornet" in d) {
    // Support both shaped objects and numeric legacy values
    const babesRaw = d.babes;
    const hornetRaw = d.hornet;

    const babesObj =
      typeof babesRaw === "object" && babesRaw !== null
        ? babesRaw
        : { current: Number(babesRaw) || 0 };
    const hornetObj =
      typeof hornetRaw === "object" && hornetRaw !== null
        ? hornetRaw
        : { current: Number(hornetRaw) || 0 };

    const babesItem: JackpotItem = {
      id: (babesObj.id as string) || randomUUID(),
      label: babesObj.label || "Bingo Babes Progressive",
      current: Number(babesObj.current) || 0,
      backup: Number(babesObj.backup) || 0,
      playTime: babesObj.playTime || "Daytime (4 PM)",
      isSession: Boolean(babesObj.isSession) || false,
      lastWonDate: babesObj.lastWonDate || undefined,
    };

    const hornetItem: JackpotItem = {
      id: (hornetObj.id as string) || randomUUID(),
      label: hornetObj.label || "Progressive Hornet",
      current: Number(hornetObj.current) || 0,
      backup: Number(hornetObj.backup) || 0,
      playTime: hornetObj.playTime || "Session",
      isSession: Boolean(hornetObj.isSession) || true,
      lastWonDate: hornetObj.lastWonDate || undefined,
    };

    currentState = {
      items: [babesItem, hornetItem],
      lastUpdated: d.lastUpdated || new Date().toISOString(),
      lastDailyUpdate: d.lastDailyUpdate || undefined,
      // Provide backwards-compatible references (non-authoritative)
      babes: { ...babesItem },
      hornet: { ...hornetItem },
    } as any;

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
    } else {
      // Defensive cast
      currentState.items = currentState.items as JackpotItem[];
    }

    // Backwards-compatible shortcuts for legacy UI that expects top-level properties
    const findByLabel = (needle: string) =>
      currentState.items.find((it) =>
        (it.label || "").toLowerCase().includes(needle),
      );

    const babesItem = findByLabel("babes");
    const hornetItem = findByLabel("hornet");

    if (babesItem) (currentState as any).babes = { ...babesItem };
    if (hornetItem) (currentState as any).hornet = { ...hornetItem };
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
