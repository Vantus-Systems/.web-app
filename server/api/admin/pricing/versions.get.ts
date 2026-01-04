import { defineEventHandler, createError } from "h3";
import { PrismaClient } from "@prisma/client";
import { assertRole } from "~/server/utils/roles";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  assertRole(user.role, ["OWNER"]);

  const versions = await prisma.pricingVersion.findMany({
    orderBy: { created_at: "desc" },
  });

  return versions;
});
