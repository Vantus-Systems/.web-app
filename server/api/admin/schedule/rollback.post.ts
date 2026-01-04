import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient } from "@prisma/client";
import { assertRole } from "~/server/utils/roles";
import { assertPermission } from "~/server/utils/permissions";
import { rollbackSchema } from "~/server/schemas/admin";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);
  assertPermission(user.role, "ops:rollback");

  const body = await readBody(event);
  const result = rollbackSchema.safeParse(body);
  if (!result.success)
    throw createError({ statusCode: 400, message: result.error.message });
  const { versionId } = result.data;

  const targetVersion = await prisma.scheduleVersion.findUnique({
    where: { id: versionId },
  });
  if (!targetVersion)
    throw createError({ statusCode: 404, message: "Version not found" });

  await prisma.$transaction(async (tx) => {
    await tx.scheduleVersion.updateMany({
      where: { status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    });

    const targetSlots = await tx.scheduleSlot.findMany({
      where: { schedule_version_id: targetVersion.id },
    });

    await tx.scheduleVersion.create({
      data: {
        status: "ACTIVE",
        created_by: user.username,
        published_at: new Date(),
        published_by: user.username,
        week_start: targetVersion.week_start,
        slots: {
          create: targetSlots.map((s) => ({
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            duration_minutes: s.duration_minutes,
            program_slug: s.program_slug,
            overrides: s.overrides,
          })),
        },
      },
    });
  });

  return { success: true };
});
