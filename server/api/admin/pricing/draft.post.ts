import { defineEventHandler, createError, readBody } from "h3";
import { PrismaClient } from "@prisma/client";
import { assertRole } from "~/server/utils/roles";
import { assertPermission } from "~/server/utils/permissions";
import { pricingContentSchema } from "~/server/schemas/admin";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);
  assertPermission(user.role, "ops:edit");

  const body = await readBody(event);
  const contentToValidate = body.content || body;

  const result = pricingContentSchema.safeParse(contentToValidate);
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.message });
  }
  const content = result.data;

  let draft = await prisma.pricingVersion.findFirst({
    where: { status: "DRAFT" },
  });

  if (!draft) {
    draft = await prisma.pricingVersion.create({
      data: {
        status: "DRAFT",
        created_by: user.username,
        content: JSON.stringify(content),
      },
    });
  } else {
    await prisma.pricingVersion.update({
      where: { id: draft.id },
      data: {
        content: JSON.stringify(content),
      },
    });
  }

  return { success: true };
});
