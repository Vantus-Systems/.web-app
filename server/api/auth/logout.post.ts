import { deleteSession } from '../../utils/sessions';

export default defineEventHandler((event) => {
  const authToken = getCookie(event, 'auth_token');
  if (authToken) {
    deleteSession(authToken);
  }

  // Clear cookies
  deleteCookie(event, 'auth_token');
  deleteCookie(event, 'auth_flag');
  deleteCookie(event, 'admin_auth');

  return { success: true };
});
