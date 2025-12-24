import { requireAuth } from '../../utils/auth';
import { getUsers, saveUsers } from '../../utils/users';

export default defineEventHandler(async (event) => {
  requireAuth(event);

  // Only admins can delete users
  const currentUser = event.context.user;
  if (currentUser.role !== 'admin') {
    throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Only admins can manage users",
    });
  }

  const query = getQuery(event);
  const id = query.id as string;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" });
  }

  if (id === currentUser.id) {
      throw createError({ statusCode: 400, statusMessage: "Cannot delete your own account" });
  }

  let users = getUsers();
  const initialLength = users.length;
  users = users.filter(u => u.id !== id);

  if (users.length === initialLength) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  saveUsers(users);
  return { success: true };
});
