import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const user = event.context.user;

  if (user) {
    return {
      user: {
        username: user.username,
        role: user.role,
        name: user.name
      }
    };
  }

  // Should be caught by requireAuth, but just in case
  throw createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
});
