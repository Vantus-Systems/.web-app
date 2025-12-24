import { H3Event } from 'h3';

export const requireAuth = (event: H3Event) => {
  const authToken = getCookie(event, 'auth_token');
  // Check against the token set in login.post.ts
  if (authToken !== 'valid_token') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};
