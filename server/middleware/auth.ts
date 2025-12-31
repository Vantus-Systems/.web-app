// server/middleware/auth.ts
import { defineEventHandler, getCookie, setCookie } from "h3";
import { authService } from "@server/services/auth.service";
import { generateCsrfToken } from "./csrf";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  if (!token) return;

  const session = await authService.verifySession(token);
  if (!session) return;

  // Attach user to context (matches your existing checks)
  event.context.user = session.user;

  // Ensure CSRF cookie is present and up to date for authenticated users
  const expectedCsrf = generateCsrfToken(token);
  const existingCsrf = getCookie(event, "csrf_token");
  if (existingCsrf !== expectedCsrf) {
    setCookie(event, "csrf_token", expectedCsrf, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expires_at ?? undefined,
    });
  }
});
