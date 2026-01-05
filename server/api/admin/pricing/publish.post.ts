import { defineEventHandler, createError } from "h3";
import { PrismaClient } from "@prisma/client";
import { assertRole } from "~/server/utils/roles";
import { assertPermission } from "~/server/utils/permissions";
import { pricingContentSchema } from "~/server/schemas/admin";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);
  assertPermission(user.role, "ops:publish");

  const draft = await prisma.pricingVersion.findFirst({
    where: { status: "DRAFT" },
  });

  if (!draft || !draft.content) {
    throw createError({ statusCode: 404, message: "No draft found" });
  }

  // Validate content structure
  try {
    const content = JSON.parse(draft.content);
    const result = pricingContentSchema.safeParse(content);
    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: "Invalid draft content: " + result.error.message,
      });
    }
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      message: "Invalid draft JSON: " + e.message,
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.pricingVersion.updateMany({
      where: { status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    });

    await tx.pricingVersion.update({
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
