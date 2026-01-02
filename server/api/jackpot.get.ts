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
  let currentState = defaultStructure;

  // If already has new structure
  if ("babes" in d && "hornet" in d) {
    currentState = d;
  }
  // Migration for legacy single-value format
  else if ("value" in d) {
    currentState = {
      babes: { current: 0, backup: 0, label: "Bingo Babes Progressive" },
      hornet: {
        current: Number(d.value) || 0,
        backup: 0,
        label: "Progressive Hornet",
      },
      lastUpdated: d.lastUpdated || new Date().toISOString(),
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

    // Check Bingo Babes
    const babes = currentState.babes as any;
    const babesLastWon = babes.lastWonDate || "";

    // "update ... if it is not won"
    if (babesLastWon !== todayStr) {
      if (babes.current >= 5000) {
        babes.backup = (babes.backup || 0) + 100;
      } else {
        babes.current = (babes.current || 0) + 100;
      }
      changed = true;
    }

    // Hornet logic? User said "each progressive".
    // "increase the progressive amount... by $100 each day".
    // I'll apply same logic to Hornet if not won.
    const hornet = currentState.hornet as any;
    const hornetLastWon = hornet.lastWonDate || "";

    if (hornetLastWon !== todayStr) {
      // Assuming Hornet has similar cap? Or just increment?
      // User didn't specify cap for Hornet, but "once the $5,000 cap is reached" was mentioned in context of "the progressive" (singular/plural ambiguity).
      // "Bingo Babes Progressive" context was explicit.
      // I'll assume same $5000 cap for Hornet for consistency or just increment current.
      // Safe bet: Increment current.
      // Re-reading: "increase the progressive amount (or the backup once the $5,000 cap is reached) by $100 each day".
      // I will apply to both.
      if (hornet.current >= 5000) {
        hornet.backup = (hornet.backup || 0) + 100;
      } else {
        hornet.current = (hornet.current || 0) + 100;
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
