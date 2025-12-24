import { H3Event } from 'h3';
import { getServerSession } from './sessions';
import { getUserById, type User } from './users';

export const requireAuth = (event: H3Event) => {
  const authToken = getCookie(event, 'auth_token');

  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No token provided',
    });
  }

  const session = await getServerSession(authToken);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};
