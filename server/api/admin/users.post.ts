import { defineEventHandler, createError, readBody } from "h3";
import { authService } from "@server/services/auth.service";
import { z } from "zod";
import prisma from "@server/db/client";
import { normalizeRole } from "~/utils/roles";
import { assertRole } from "~/server/utils/roles";

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["OWNER", "CHARITY", "MIC", "admin", "mic", "CALLER", "caller"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  const { username, password, role, firstName, lastName, email, phone, isActive } =
    userSchema.parse(body);
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) {
    throw createError({ statusCode: 400, message: "Invalid role" });
  }

  const existing = await authService.getUserByUsername(username);
  if (existing) {
    throw createError({ statusCode: 409, message: "Username already exists" });
  }

  const hash = await authService.hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      password_hash: hash,
      role: normalizedRole,
      first_name: firstName || null,
      last_name: lastName || null,
      email: email || null,
      phone: phone || null,
      is_active: isActive ?? true,
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
    is_active: user.is_active,
  };
});
