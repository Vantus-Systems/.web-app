import { requireAuth } from "../../utils/auth";
import { getUsers, type User } from "../../utils/users";

export default defineEventHandler((event) => {
  requireAuth(event);

  // Only admins can list users
  const currentUser = event.context.user;
  if (currentUser.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Only admins can view users",
    });
  }

  const users = getUsers();
  // Return users without sensitive data
  return users.map((u: User) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
  }));
});
