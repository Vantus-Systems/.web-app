import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient } from "@prisma/client";
import { assertRole } from "~/server/utils/roles";
import { assertPermission } from "~/server/utils/permissions";
import { scheduleDraftSchema } from "~/server/schemas/admin";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);
  assertPermission(user.role, "ops:edit");

  const body = await readBody(event);
  const result = scheduleDraftSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.message });
  }
  /* eslint-disable camelcase */
  const { slots, week_start } = result.data;

  let draft = await prisma.scheduleVersion.findFirst({
    where: { status: "DRAFT" },
  });

  if (!draft) {
    draft = await prisma.scheduleVersion.create({
      data: {
        status: "DRAFT",
        created_by: user.username,
      },
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.scheduleVersion.update({
      where: { id: draft.id },
      data: {
        week_start: week_start ? new Date(week_start) : null,
      },
    });
    /* eslint-enable camelcase */

    await tx.scheduleSlot.deleteMany({
      where: { schedule_version_id: draft.id },
    });

    if (slots.length > 0) {
      await tx.scheduleSlot.createMany({
        data: slots.map((s) => ({
          schedule_version_id: draft.id,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          duration_minutes: s.duration_minutes,
          program_slug: s.program_slug,
          overrides: s.overrides ? JSON.stringify(s.overrides) : null,
        })),
      });
    }
  });

  return { success: true };
});
