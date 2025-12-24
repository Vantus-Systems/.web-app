import { H3Event } from 'h3';
import { getSession } from './sessions';
import { getUserById, type User } from './users';

export const requireAuth = async (event: H3Event) => {
  const authToken = getCookie(event, 'auth_token');

  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No token provided',
    });
  }

  const session = await getSession(authToken);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid or expired token',
    });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: User not found',
    });
  }

  // Attach user to context for downstream use
  event.context.user = user;
};
