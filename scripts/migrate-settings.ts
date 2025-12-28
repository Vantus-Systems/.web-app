import { PrismaClient } from "@prisma/client";
import { settingsService } from "../server/services/settings.service";

const prisma = new PrismaClient();

async function main() {
  console.log("Migrating legacy settings to Version tables...");

  // Schedule
  const schedule = (await settingsService.get("schedule")) || [];
  const scheduleJson = JSON.stringify(schedule);

  const existingScheduleActive = await prisma.scheduleVersion.findFirst({
    where: { status: "ACTIVE" },
  });
  if (!existingScheduleActive) {
    console.log("Creating initial ACTIVE schedule version...");
    await prisma.scheduleVersion.create({
      data: {
        status: "ACTIVE",
        data: scheduleJson,
        publishedAt: new Date(),
        createdBy: "migration",
      },
    });
  }

  // Create initial Draft for schedule
  const existingScheduleDraft = await prisma.scheduleVersion.findFirst({
    where: { status: "DRAFT" },
  });
  if (!existingScheduleDraft) {
    console.log("Creating initial DRAFT schedule version...");
    await prisma.scheduleVersion.create({
      data: {
        status: "DRAFT",
        data: scheduleJson,
        createdBy: "migration",
      },
    });
  }

  // Pricing
  const pricing = (await settingsService.get("pricing")) || {};
  const pricingJson = JSON.stringify(pricing);

  const existingPricingActive = await prisma.pricingVersion.findFirst({
    where: { status: "ACTIVE" },
  });
  if (!existingPricingActive) {
    console.log("Creating initial ACTIVE pricing version...");
    await prisma.pricingVersion.create({
      data: {
        status: "ACTIVE",
        data: pricingJson,
        publishedAt: new Date(),
        createdBy: "migration",
      },
    });
  }

  // Create initial Draft for pricing
  const existingPricingDraft = await prisma.pricingVersion.findFirst({
    where: { status: "DRAFT" },
  });
  if (!existingPricingDraft) {
    console.log("Creating initial DRAFT pricing version...");
    await prisma.pricingVersion.create({
      data: {
        status: "DRAFT",
        data: pricingJson,
        createdBy: "migration",
      },
    });
  }

  console.log("Migration complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
