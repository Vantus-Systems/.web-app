/**
 * CSRF Protection Middleware
 * Validates CSRF tokens on all mutating requests (POST, PUT, PATCH, DELETE)
 */

import { createHash } from "crypto";
import { defineEventHandler, getCookie, getHeader, createError } from "h3";

const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf_token";

let warnedMissingSecret = false;

/**
 * Generate a CSRF token hash from session token
 */
function generateCsrfToken(sessionToken: string): string {
  const secret = process.env.APP_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw createError({
        statusCode: 500,
        message: "Server misconfigured: APP_SECRET is required in production",
      });
    }
    if (!warnedMissingSecret) {
      warnedMissingSecret = true;
      console.warn(
        "[csrf] APP_SECRET is not set; using an insecure development fallback secret.",
      );
    }
  }

  return createHash("sha256")
    .update(`csrf:${sessionToken}:${secret || "dev-secret"}`)
    .digest("hex");
}

/**
 * Validate CSRF token matches session
 */
function validateCsrfToken(sessionToken: string, csrfToken: string): boolean {
  const expected = generateCsrfToken(sessionToken);
  return csrfToken === expected;
}

export default defineEventHandler((event) => {
  const method = event.method;

  // Only validate mutating requests
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return;
  }

  // Skip CSRF for login endpoint (no session yet)
  if (event.path === "/api/auth/login") {
    return;
  }

  // Skip CSRF for public endpoints
  if (
    !event.path.startsWith("/api/admin") &&
    !event.path.startsWith("/api/auth/logout")
  ) {
    return;
  }

  const sessionToken = getCookie(event, "auth_token");
  if (!sessionToken) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const csrfToken =
    getHeader(event, CSRF_HEADER) || getCookie(event, CSRF_COOKIE);
  if (!csrfToken) {
    throw createError({
      statusCode: 403,
      message: "CSRF token missing",
    });
  }

  if (!validateCsrfToken(sessionToken, csrfToken)) {
    throw createError({
      statusCode: 403,
      message: "CSRF token invalid",
    });
  }
});

/**
 * Generate CSRF token for a session
 * Export for use in auth endpoints
 */
export { generateCsrfToken };
