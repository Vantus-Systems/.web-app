import { z } from 'zod';
import { getUserByUsername, verifyPassword } from '../../utils/users';
import { createSession } from '../../utils/sessions';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Simple memory-based rate limiting
const loginAttempts = new Map<string, { count: number, reset: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Validation
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid input",
      data: result.error.errors,
    });
  }

  const { username, password } = result.data;

  // Rate Limiting
  const ip = getRequestIP(event) || 'unknown';
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (attempt) {
    if (now > attempt.reset) {
      loginAttempts.delete(ip);
    } else if (attempt.count >= MAX_ATTEMPTS) {
      throw createError({
        statusCode: 429,
        statusMessage: "Too many login attempts. Please try again later.",
      });
    }
  }

  // Auth Logic
  const user = await getUserByUsername(username);

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    // Increment rate limit
    const current = loginAttempts.get(ip) || { count: 0, reset: now + BLOCK_DURATION };
    current.count++;
    loginAttempts.set(ip, current);

    // Generic error to avoid username enumeration (though timing attacks are mitigated by verifyPassword being somewhat constant time, user lookup is not.
    // Ideally we should always verify a dummy password if user not found, but for now this is better than before).
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid username or password",
    });
  }

  // Clear rate limit on success
  loginAttempts.delete(ip);

  // Create Session
  const token = await createSession(user.id);

  // Set Cookie
  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: 'lax', // or 'strict' depending on requirements
  });

  // Set Auth Flag (accessible by client)
  setCookie(event, "auth_flag", "1", {
    httpOnly: false, // Client needs to see this
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return { success: true, user: { username: user.username, role: user.role, name: user.name } };
});
