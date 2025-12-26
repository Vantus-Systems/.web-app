// server/middleware/auth.ts
import { defineEventHandler, getCookie } from "h3";
import { authService } from "@server/services/auth.service";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  if (!token) return;

  const session = await authService.verifySession(token);
  if (!session) return;

  // Attach user to context (matches your existing checks)
  event.context.user = session.user;
});
