import { defineEventHandler, createError } from "h3";
import { PrismaClient } from "@prisma/client";
import { assertRole } from "~/server/utils/roles";
import { assertPermission } from "~/server/utils/permissions";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);
  assertPermission(user.role, "ops:publish");

  const draft = await prisma.pricingVersion.findFirst({
    where: { status: "DRAFT" },
  });

  if (!draft) {
    throw createError({ statusCode: 404, message: "No draft found" });
  }

  // Optional: Validate content structure deeper if needed, but schema check on save covers basics.

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
