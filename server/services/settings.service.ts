// server/services/settings.service.ts
import prisma from "@server/db/client";

export const settingsService = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const row = await prisma.setting.findUnique({ where: { key } });
    return (row?.value as T) ?? null;
  },

  async set<T = unknown>(key: string, value: T): Promise<T> {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: value as any },
      update: { value: value as any },
    });
    return value;
  },
};
