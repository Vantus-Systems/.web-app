import { defineEventHandler, createError, readBody } from "h3";
import { authService } from "@server/services/auth.service";
import { z } from "zod";
import prisma from "@server/db/client";

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["admin", "mic"]),
});

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const { username, password, role } = userSchema.parse(body);

  const existing = await authService.getUserByUsername(username);
  if (existing) {
    throw createError({ statusCode: 409, message: "Username already exists" });
  }

  const hash = await authService.hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      password_hash: hash,
      role,
    },
  });

  return { id: user.id, username: user.username, role: user.role };
});
