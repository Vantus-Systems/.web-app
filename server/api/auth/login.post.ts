import {
  defineEventHandler,
  readBody,
  createError,
  setCookie,
  getHeader,
  getRequestIP,
} from "h3";
import { z } from "zod";
import { authService } from "@server/services/auth.service";
import { generateCsrfToken } from "@server/middleware/csrf";
import { rateLimiter } from "@server/utils/rateLimiter";
import prisma from "@server/db/client";
import { normalizeRole } from "~/utils/roles";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
    const rateLimitKey = `login:${ip}`;

    if (
      !rateLimiter.checkLimit(rateLimitKey, {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000,
      })
    ) {
      const resetTime = rateLimiter.getResetTime(rateLimitKey);
      throw createError({
        statusCode: 429,
        message: `Too many login attempts. Try again in ${resetTime} seconds.`,
      });
    }

    const body = await readBody(event);
    const { username, password } = loginSchema.parse(body);

    const user = await authService.getUserByUsername(username);
    if (!user) {
      throw createError({ statusCode: 401, message: "Invalid credentials" });
    }
    if (user.is_active === false) {
      throw createError({ statusCode: 403, message: "Account is inactive" });
    }

    const valid = await authService.verifyPassword(
      password,
      user.password_hash,
    );
    if (!valid) {
      throw createError({ statusCode: 401, message: "Invalid credentials" });
    }

    // Successful login - clear rate limit
    rateLimiter.clearLimit(rateLimitKey);

    // Update last_login_at
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Create session
    const userAgent = getHeader(event, "user-agent");
    const { token, expiresAt } = await authService.createSession(
      user.id,
      ip,
      userAgent,
    );

    // Set cookies
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    // Generate and set CSRF token (derived from session token)
    const csrfToken = generateCsrfToken(token);
    setCookie(event, "csrf_token", csrfToken, {
      httpOnly: false, // JS needs to read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: normalizeRole(user.role),
        rawRole: user.role,
        is_active: user.is_active ?? true,
      },
    };
  } catch (error: any) {
    console.error("Login Error:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Validation failed",
        data: error.errors,
      });
    }

    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: error.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
