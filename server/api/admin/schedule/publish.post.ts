import { defineEventHandler, createError } from "h3";
import { PrismaClient } from "@prisma/client";
import { assertRole } from "~/server/utils/roles";
import { assertPermission } from "~/server/utils/permissions";
import { hasOverlaps } from "~/server/utils/schedule.utils";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);
  assertPermission(user.role, "ops:publish");

  const draft = await prisma.scheduleVersion.findFirst({
    where: { status: "DRAFT" },
    include: { slots: true },
  });

  if (!draft) {
    throw createError({ statusCode: 404, message: "No draft found" });
  }

  if (hasOverlaps(draft.slots)) {
    throw createError({
      statusCode: 400,
      message: "Schedule contains overlaps",
    });
  }

  const programs = await prisma.bingoProgram.findMany({
    select: { slug: true },
  });
  const programSlugs = new Set(programs.map((p) => p.slug));
  for (const slot of draft.slots) {
    if (!programSlugs.has(slot.program_slug)) {
      throw createError({
        statusCode: 400,
        message: `Invalid program slug: ${slot.program_slug}`,
      });
    }
  }

  for (const slot of draft.slots) {
    if (!slot.start_time.endsWith(":00") && !slot.start_time.endsWith(":30")) {
      throw createError({
        statusCode: 400,
        message: `Slot start time must be :00 or :30: ${slot.start_time}`,
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.scheduleVersion.updateMany({
      where: { status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    });

    await tx.scheduleVersion.update({
      where: { id: draft.id },
      data: {
        status: "ACTIVE",
        published_at: new Date(),
        published_by: user.username,
      },
    });
  });

  return { success: true };
});
