export default defineNuxtRouteMiddleware((to, _from) => {
  const auth = useCookie("admin_auth");

  if (!auth.value && to.path !== "/admin/login") {
    return navigateTo("/admin/login");
  }
});
