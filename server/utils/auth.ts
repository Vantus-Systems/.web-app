import { H3Event } from 'h3';
import { getSession } from './sessions';
import { getUserById } from './users';

export const requireAuth = (event: H3Event) => {
  const authToken = getCookie(event, 'auth_token');

  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No token provided',
    });
  }

  const session = getSession(authToken);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid session',
    });
  }

  const user = getUserById(session.userId);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: User not found',
    });
  }

  // Attach user to event context for easier access in endpoints
  event.context.user = user;
};
