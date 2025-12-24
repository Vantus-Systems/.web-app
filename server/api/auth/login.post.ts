import { z } from "zod";
import { setCookie, createError, readBody, getRequestIP } from "h3";
import { getUserByUsername, verifyPassword } from "../../utils/users";
import { createSession } from "../../utils/sessions";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Simple memory-based rate limiting keyed by IP
const loginAttempts = new Map<string, { count: number; reset: number }>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid input",
      data: result.error.errors,
    });
  }

  const { username, password } = result.data;

  // Rate limiting by IP
  const ip = getRequestIP(event) || "unknown";
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

  // Lookup user and verify password
  const user = getUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    const current = loginAttempts.get(ip) || { count: 0, reset: now + BLOCK_DURATION };
    current.count++;
    loginAttempts.set(ip, current);

    throw createError({
      statusCode: 401,
      statusMessage: "Invalid username or password",
    });
  }

  // Clear rate limit for this IP on success
  loginAttempts.delete(ip);

  // Create session token (file-backed sessions)
  const token = createSession(user.id);

  // Set auth token (httpOnly)
  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax",
  });

  // Set client-visible admin flag cookie (used by client-side navigation guard)
  setCookie(event, "admin_auth", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });

  return { success: true, user: { username: user.username, name: user.name, role: user.role } };
});
