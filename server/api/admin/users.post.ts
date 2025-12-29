import { defineEventHandler, createError, readBody } from "h3";
import { authService } from "@server/services/auth.service";
import { z } from "zod";
import prisma from "@server/db/client";

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["admin", "mic"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const body = await readBody(event);
  const { username, password, role, firstName, lastName, email, phone } =
    userSchema.parse(body);

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
      first_name: firstName || null,
      last_name: lastName || null,
      email: email || null,
      phone: phone || null,
    },
  });

  return {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
});
