import { defineEventHandler } from "h3";
import { PrismaClient } from "@prisma/client";
import { settingsService } from "@server/services/settings.service";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try {
    const activeVersion = await prisma.pricingVersion.findFirst({
      where: { status: "ACTIVE" },
    });

    if (activeVersion && activeVersion.content) {
      try {
        return JSON.parse(activeVersion.content);
      } catch (e) {
        console.error("Failed to parse active pricing version content", e);
        // Fallback to legacy settings if parsing fails
      }
    }
  } catch (e) {
    console.error("Failed to fetch active pricing version", e);
  }

  // Fallback to legacy settings if no active version found or error occurs
  const data = await settingsService.get("pricing");
  return data || {};
});
