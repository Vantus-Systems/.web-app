import { deleteCookie } from "h3";

export default defineEventHandler((event) => {
  deleteCookie(event, "auth_token");
  deleteCookie(event, "admin_auth");
  return { success: true };
});
