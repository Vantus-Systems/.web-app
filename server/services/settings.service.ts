// server/services/settings.service.ts
import fs from "fs/promises";
import path from "path";
import prisma from "@server/db/client";

const DATA_DIR = path.join(process.cwd(), "server", "data");

async function readDataFile<T>(key: string): Promise<T | null> {
  try {
    const p = path.join(DATA_DIR, `${key}.json`);
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as T;
  } catch (e) {
    return null;
  }
}

async function writeDataFile<T>(key: string, value: T): Promise<void> {
  try {
    const p = path.join(DATA_DIR, `${key}.json`);
    await fs.writeFile(p, JSON.stringify(value, null, 2), "utf8");
  } catch (e) {
    // non-fatal
    console.warn("Failed to write fallback settings file", e);
  }
}

export const settingsService = {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (process.env.DATABASE_URL) {
      try {
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
      } catch (e: any) {
        // Fall back to file-based settings if Prisma isn't available
        console.warn("Prisma unavailable for settings.get:", e?.message || e);
      }
    }

    // Fall back to JSON file in server/data
    return await readDataFile<T>(key);
  },

  async set<T = unknown>(key: string, value: T): Promise<T> {
    if (process.env.DATABASE_URL) {
      try {
        // Store as JSON string for SQLite compatibility
        const stringValue = JSON.stringify(value);
        await prisma.setting.upsert({
          where: { key },
          create: { key, value: stringValue },
          update: { value: stringValue },
        });
        return value;
      } catch (e: any) {
        console.warn("Prisma unavailable for settings.set:", e?.message || e);
      }
    }

    await writeDataFile<T>(key, value);
    return value;
  },
};
