import { defineEventHandler, createError } from "h3";

export default defineEventHandler((event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  return {
    user: {
      id: event.context.user.id,
      username: event.context.user.username,
      role: event.context.user.role,
    },
  };
});
