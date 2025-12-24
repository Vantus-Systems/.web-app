import { promises as fs } from "fs";
import { resolve } from "path";

const DATA_DIR = resolve(process.cwd(), "server/data");

export const getStoragePath = (filename: string) => resolve(DATA_DIR, filename);

export async function readJson<T>(
  filename: string,
  defaultValue: T,
): Promise<T> {
  try {
    const filePath = getStoragePath(filename);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    // If file doesn't exist, return default value and maybe create it?
    // For now, just return default.
    return defaultValue;
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = getStoragePath(filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
