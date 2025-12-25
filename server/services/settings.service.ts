import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

const resolveDataPath = (key: string) => join(dataDir, `${key}.json`);

const readSettingFile = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const contents = await readFile(resolveDataPath(key), "utf-8");
    return JSON.parse(contents) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const writeSettingFile = async (key: string, value: any) => {
  await writeFile(
    resolveDataPath(key),
    JSON.stringify(value, null, 2) + "\n",
    "utf-8",
  );
  return value;
};

export const settingsService = {
  get(key: string) {
    return readSettingFile(key);
  },

  set(key: string, value: any) {
    return writeSettingFile(key, value);
  },
};
