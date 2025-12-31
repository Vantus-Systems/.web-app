import { defineEventHandler, deleteCookie, getCookie } from "h3";
import { authService } from "@server/services/auth.service";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  if (token) {
    await authService.revokeSession(token);
  }

  const cookieOptions = {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  deleteCookie(event, "auth_token", cookieOptions);
  deleteCookie(event, "csrf_token", cookieOptions);

  return { success: true };
});
