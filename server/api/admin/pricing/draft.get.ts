import { defineEventHandler, createError } from "h3";
import { PrismaClient } from "@prisma/client";
import { settingsService } from "@server/services/settings.service";
import { assertRole } from "~/server/utils/roles";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);

  let draft = await prisma.pricingVersion.findFirst({
    where: { status: "DRAFT" },
  });

  if (!draft) {
    const active = await prisma.pricingVersion.findFirst({
      where: { status: "ACTIVE" },
    });

    let content = "{}";

    if (active) {
      content = active.content;
    } else {
      // Migration: Try to get legacy pricing settings
      const legacyPricing = await settingsService.get("pricing");
      if (legacyPricing) {
        content = JSON.stringify(legacyPricing);
      }
    }

    draft = await prisma.pricingVersion.create({
      data: {
        status: "DRAFT",
        created_by: user.username,
        content,
      },
    });
  }

  return draft;
});
