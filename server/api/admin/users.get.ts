import { requireAuth } from '../../utils/auth';
import { getUsers, type User } from '../../utils/users';

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  // Only admins can list users
  const currentUser = event.context.user;
  if (!currentUser || currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Only admins can view users",
    });
  }

  const users = await getUsers();
  // Return users without sensitive data
  return users.map((u: User) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role
  }));
});
