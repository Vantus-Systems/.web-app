import { defineEventHandler, createError, readBody } from "h3";
import prisma from "@server/db/client";
import { authService } from "@server/services/auth.service";
import { z } from "zod";

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "mic"]).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  if (!event.context.user || event.context.user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, message: "Missing user id" });
  }

  const body = await readBody(event);
  const data = updateUserSchema.parse(body);

  if (data.username) {
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing && existing.id !== id) {
      throw createError({ statusCode: 409, message: "Username already exists" });
    }
  }

  const updateData: Record<string, unknown> = {};

  if (data.username !== undefined) updateData.username = data.username;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.firstName !== undefined) updateData.first_name = data.firstName;
  if (data.lastName !== undefined) updateData.last_name = data.lastName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;

  if (data.password) {
    updateData.password_hash = await authService.hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    last_login_at: user.last_login_at,
  };
});
