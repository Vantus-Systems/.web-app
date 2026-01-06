import { defineEventHandler, createError } from "h3";
import { PrismaClient } from "@prisma/client";
import { assertRole } from "~/server/utils/roles";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);

  // Find existing draft
  let draft = await prisma.scheduleVersion.findFirst({
    where: { status: "DRAFT" },
    include: { slots: true },
  });

  if (!draft) {
    // Check for ACTIVE to copy from
    const active = await prisma.scheduleVersion.findFirst({
      where: { status: "ACTIVE" },
      include: { slots: true },
    });

    if (active) {
      // Create draft from active
      draft = await prisma.scheduleVersion.create({
        data: {
          status: "DRAFT",
          created_by: user.username,
          week_start: active.week_start,
          slots: {
            create: active.slots.map((s) => ({
              day_of_week: s.day_of_week,
              start_time: s.start_time,
              duration_minutes: s.duration_minutes,
              program_slug: s.program_slug,
              overrides: s.overrides,
            })),
          },
        },
        include: { slots: true },
      });
    } else {
      // Create empty draft
      draft = await prisma.scheduleVersion.create({
        data: {
          status: "DRAFT",
          created_by: user.username,
        },
        include: { slots: true },
      });
    }
  }

  // Parse overrides if they are strings
  const parsedSlots = draft.slots.map((slot) => {
    let overrides: any = slot.overrides;
    if (typeof overrides === "string") {
      try {
        overrides = JSON.parse(overrides);
      } catch {
        overrides = {};
      }
    }
    return { ...slot, overrides };
  });

  return { ...draft, slots: parsedSlots };
});
