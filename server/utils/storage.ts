import { promises as fs } from "fs";
import { resolve, dirname, normalize, join } from "path";

const DATA_DIR = resolve(process.cwd(), "server/data");

export const getStoragePath = (filename: string) => {
  // Prevent directory traversal
  const targetPath = resolve(DATA_DIR, filename);
  if (!targetPath.startsWith(DATA_DIR)) {
    throw new Error("Invalid file path");
  }
  return targetPath;
};

export async function readJson<T>(
  filename: string,
  defaultValue: T,
): Promise<T> {
  try {
    const filePath = getStoragePath(filename);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default value
    return defaultValue;
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = getStoragePath(filename);
  await fs.mkdir(dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
