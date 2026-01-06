import { defineEventHandler } from "h3";
import prisma from "@server/db/client";
import { normalizeRole } from "~/utils/roles";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER", "MIC"]);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      role: true,
      last_login_at: true,
      is_active: true,
    },
  });

  return users.map((user) => ({
    ...user,
    role: normalizeRole(user.role),
    rawRole: user.role,
  }));
});
