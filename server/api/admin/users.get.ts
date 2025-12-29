import { defineEventHandler, createError } from "h3";
import prisma from "@server/db/client";

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

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
    },
  });

  return users;
});
