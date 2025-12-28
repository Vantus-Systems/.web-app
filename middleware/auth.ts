export default defineNuxtRouteMiddleware((to, _from) => {
  const auth = useCookie("admin_auth", { path: "/" });

  if (!auth.value && to.path !== "/admin/login") {
    return navigateTo("/admin/login");
  }
});
