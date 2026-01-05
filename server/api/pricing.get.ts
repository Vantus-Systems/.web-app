import { defineEventHandler, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";
import { settingsService } from "@server/services/settings.service";
import { pricingCompiler } from "~/server/services/pricingCompiler";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateStr = query.date as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  try {
    const activeVersion = await prisma.pricingVersion.findFirst({
      where: { status: "ACTIVE" },
    });

    if (activeVersion && activeVersion.content) {
      try {
        const content = JSON.parse(activeVersion.content);
        return pricingCompiler.compileForPublic(content, date);
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
