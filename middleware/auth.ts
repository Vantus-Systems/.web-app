export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (to.path === "/admin/login") {
    return;
  }

  try {
    const headers = useRequestHeaders(["cookie"]);
    const response = await $fetch<{ user: { role?: string } }>(
      "/api/auth/user",
      { headers, credentials: "include" },
    );
    if (response?.user?.role !== "admin") {
      return navigateTo("/admin/login");
    }
  } catch {
    return navigateTo("/admin/login");
  }
});
