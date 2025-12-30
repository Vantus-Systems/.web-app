/**
 * Version Control Service
 * Implements draft → publish → rollback workflow for admin-managed content
 */

import prisma from "@server/db/client";

export interface VersionMetadata {
  version: number;
  publishedAt: Date;
  publishedBy: string;
  comment?: string;
}

/**
 * Version-controlled setting with history
 */
export const versionService = {
  /**
   * Get the current draft version of a setting
   */
  async getDraft(key: string): Promise<any | null> {
    const setting = await prisma.setting.findUnique({
      where: { key: `${key}:draft` },
    });
    return setting ? JSON.parse(setting.value) : null;
  },

  /**
   * Save a draft version (does not publish)
   */
  async saveDraft(
    key: string,
    value: any,
    actorUserId: string,
  ): Promise<void> {
    const stringValue = JSON.stringify(value);
    await prisma.setting.upsert({
      where: { key: `${key}:draft` },
      create: { key: `${key}:draft`, value: stringValue },
      update: { value: stringValue },
    });
  },

  /**
   * Get the current published (active) version
   */
  async getPublished(key: string): Promise<any | null> {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting ? JSON.parse(setting.value) : null;
  },

  /**
   * Publish a draft (makes it the active version and saves to history)
   */
  async publish(
    key: string,
    actorUserId: string,
    comment?: string,
  ): Promise<{ version: number }> {
    const draft = await this.getDraft(key);
    if (!draft) {
      throw new Error("No draft to publish");
    }

    // Get current version number
    const versionKey = `${key}:version`;
    const versionSetting = await prisma.setting.findUnique({
      where: { key: versionKey },
    });
    const currentVersion = versionSetting
      ? parseInt(JSON.parse(versionSetting.value))
      : 0;
    const newVersion = currentVersion + 1;

    // Save current published to history (if exists)
    const currentPublished = await this.getPublished(key);
    if (currentPublished) {
      const historyKey = `${key}:history:${currentVersion}`;
      const metadata: VersionMetadata = {
        version: currentVersion,
        publishedAt: new Date(),
        publishedBy: actorUserId,
        comment,
      };
      await prisma.setting.create({
        data: {
          key: historyKey,
          value: JSON.stringify({
            data: currentPublished,
            metadata,
          }),
        },
      });
    }

    // Publish draft as new active version
    const stringValue = JSON.stringify(draft);
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: stringValue },
      update: { value: stringValue },
    });

    // Update version counter
    await prisma.setting.upsert({
      where: { key: versionKey },
      create: { key: versionKey, value: JSON.stringify(newVersion) },
      update: { value: JSON.stringify(newVersion) },
    });

    return { version: newVersion };
  },

  /**
   * Get version history
   */
  async getHistory(
    key: string,
    limit: number = 10,
  ): Promise<Array<{ version: number; data: any; metadata: VersionMetadata }>> {
    const historyPrefix = `${key}:history:`;
    const historySettings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: historyPrefix,
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: limit,
    });

    return historySettings.map((setting) => {
      const parsed = JSON.parse(setting.value);
      return {
        version: parsed.metadata.version,
        data: parsed.data,
        metadata: parsed.metadata,
      };
    });
  },

  /**
   * Rollback to a specific version
   */
  async rollback(
    key: string,
    version: number,
    actorUserId: string,
    comment?: string,
  ): Promise<void> {
    // Get the version from history
    const historyKey = `${key}:history:${version}`;
    const historySetting = await prisma.setting.findUnique({
      where: { key: historyKey },
    });

    if (!historySetting) {
      throw new Error(`Version ${version} not found`);
    }

    const parsed = JSON.parse(historySetting.value);
    const dataToRestore = parsed.data;

    // Save current published to history before rollback
    const currentPublished = await this.getPublished(key);
    if (currentPublished) {
      const versionKey = `${key}:version`;
      const versionSetting = await prisma.setting.findUnique({
        where: { key: versionKey },
      });
      const currentVersion = versionSetting
        ? parseInt(JSON.parse(versionSetting.value))
        : 0;

      const rollbackHistoryKey = `${key}:history:${currentVersion}`;
      const metadata: VersionMetadata = {
        version: currentVersion,
        publishedAt: new Date(),
        publishedBy: actorUserId,
        comment: `Rollback to version ${version}: ${comment || ""}`,
      };
      await prisma.setting.create({
        data: {
          key: rollbackHistoryKey,
          value: JSON.stringify({
            data: currentPublished,
            metadata,
          }),
        },
      });
    }

    // Restore the version
    const stringValue = JSON.stringify(dataToRestore);
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: stringValue },
      update: { value: stringValue },
    });

    // Also update draft to match
    await prisma.setting.upsert({
      where: { key: `${key}:draft` },
      create: { key: `${key}:draft`, value: stringValue },
      update: { value: stringValue },
    });
  },

  /**
   * Discard draft (revert to published)
   */
  async discardDraft(key: string): Promise<void> {
    const published = await this.getPublished(key);
    if (published) {
      await prisma.setting.update({
        where: { key: `${key}:draft` },
        data: { value: JSON.stringify(published) },
      });
    } else {
      await prisma.setting.delete({
        where: { key: `${key}:draft` },
      });
    }
  },
};
