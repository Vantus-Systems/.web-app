// server/services/settings.service.ts
import prisma from "@server/db/client";

export const settingsService = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row) {
      // The value is stored as a JSON string in SQLite
      if (typeof row.value === "string") {
        try {
          return JSON.parse(row.value) as T;
        } catch {
          // If parsing fails, return as-is (might be a legacy object)
          return row.value as unknown as T;
        }
      }
      return row.value as T;
    }
    return null;
  },

  async set<T = unknown>(key: string, value: T): Promise<T> {
    // Store as JSON string for SQLite compatibility
    const stringValue = JSON.stringify(value);
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: stringValue },
      update: { value: stringValue },
    });
    return value;
  },
};
