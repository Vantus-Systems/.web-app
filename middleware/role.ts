import { hasRole } from "~/utils/roles";

export default defineNuxtRouteMiddleware(async (to) => {
  const roles = (to.meta?.roles as string[] | undefined) ?? [];
  if (roles.length === 0) {
    return;
  }

  try {
    const headers = useRequestHeaders(["cookie"]);
    const response = await $fetch<{ user: { role?: string } }>(
      "/api/auth/user",
      { headers, credentials: "include" },
    );
    if (!hasRole(response?.user?.role ?? null, roles as any)) {
      return navigateTo("/admin/login");
    }
  } catch {
    return navigateTo("/admin/login");
  }
});
