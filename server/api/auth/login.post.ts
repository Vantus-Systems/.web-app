import { verifyPassword, getUserByUsername } from '../../utils/users';
import { createSession } from '../../utils/sessions';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username and password are required",
    });
  }

  const user = getUserByUsername(username || 'admin');

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  if (verifyPassword(password, user.passwordHash, user.salt)) {
    const token = createSession(user.id);

    // Secure HttpOnly cookie for server-side auth
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: 'strict'
    });

    // Public flag cookie for client-side middleware
    setCookie(event, "auth_flag", "1", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
        sameSite: 'strict'
    });

    // Clear legacy cookie
    setCookie(event, "admin_auth", "", {
        maxAge: -1,
        path: "/"
    });

    return { success: true, user: { username: user.username, role: user.role, name: user.name } };
  }

  throw createError({
    statusCode: 401,
    statusMessage: "Invalid credentials",
  });
});
