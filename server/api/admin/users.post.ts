import { defineEventHandler, createError, readBody } from "h3";
import { authService } from "@server/services/auth.service";
import { auditService } from "@server/services/audit.service";
import { z } from "zod";
import prisma from "@server/db/client";
import { normalizeRole } from "~/utils/roles";
import { assertPermission } from "~/server/utils/permissions";

// Strong password validation
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const userSchema = z.object({
  username: z.string().min(3).max(50),
  password: passwordSchema,
  role: z.enum(["OWNER", "CHARITY", "MIC", "admin", "mic", "CALLER", "caller"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  assertPermission(event.context.user?.role, "people:edit");

  const body = await readBody(event);
  const {
    username,
    password,
    role,
    firstName,
    lastName,
    email,
    phone,
    isActive,
  } = userSchema.parse(body);
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

  // Audit log
  await auditService.log({
    actorUserId: event.context.user.id,
    action: "CREATE_USER",
    entity: `user:${user.id}`,
    after: {
      username: user.username,
      role: user.role,
      is_active: user.is_active,
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
