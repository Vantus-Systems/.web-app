import { defineEventHandler, deleteCookie, getCookie } from "h3";
import { authService } from "@server/services/auth.service";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  if (token) {
    await authService.revokeSession(token);
  }

  deleteCookie(event, "auth_token");
  deleteCookie(event, "csrf_token");

  return { success: true };
});
