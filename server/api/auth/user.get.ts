import { defineEventHandler, createError } from "h3";
import { normalizeRole } from "~/utils/roles";

export default defineEventHandler((event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  return {
    user: {
      id: event.context.user.id,
      username: event.context.user.username,
      role: normalizeRole(event.context.user.role),
      rawRole: event.context.user.role,
      is_active: event.context.user.is_active ?? true,
    },
  };
});
