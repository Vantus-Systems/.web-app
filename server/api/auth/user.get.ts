import { requireAuth } from '../../utils/auth';

export default defineEventHandler((event) => {
  requireAuth(event);
  const user = event.context.user;

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  };
});
