import { H3Event } from 'h3';

export const requireAuth = (event: H3Event) => {
  const authCookie = getCookie(event, 'admin_auth');
  if (authCookie !== 'true') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
};
