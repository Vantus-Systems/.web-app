import { defineEventHandler, createError, readBody } from "h3";
import prisma from "@server/db/client";
import { authService } from "@server/services/auth.service";
import { z } from "zod";
import { normalizeRole } from "~/utils/roles";
import { assertRole } from "~/server/utils/roles";

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  role: z
    .enum(["OWNER", "CHARITY", "MIC", "admin", "mic", "CALLER", "caller"])
    .optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

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
      throw createError({
        statusCode: 409,
        message: "Username already exists",
      });
    }
  }

  const updateData: Record<string, unknown> = {};

  if (data.username !== undefined) updateData.username = data.username;
  if (data.role !== undefined) {
    const normalizedRole = normalizeRole(data.role);
    if (!normalizedRole) {
      throw createError({ statusCode: 400, message: "Invalid role" });
    }
    updateData.role = normalizedRole;
  }
  if (data.firstName !== undefined) updateData.first_name = data.firstName;
  if (data.lastName !== undefined) updateData.last_name = data.lastName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  if (data.password) {
    updateData.password_hash = await authService.hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  // Audit log
  await auditService.log({
    actorUserId: event.context.user.id,
    action: "UPDATE_USER",
    entity: `user:${user.id}`,
    after: {
      username: user.username,
      role: user.role,
      is_active: user.is_active,
      updated_fields: Object.keys(updateData),
    },
  });

  return {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: normalizeRole(user.role),
    rawRole: user.role,
    last_login_at: user.last_login_at,
    is_active: user.is_active,
  };
});
