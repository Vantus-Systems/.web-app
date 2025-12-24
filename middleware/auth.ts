export default defineNuxtRouteMiddleware((to, _from) => {
  const authFlag = useCookie("auth_flag");

  if (!authFlag.value && to.path !== "/admin/login") {
    return navigateTo("/admin/login");
  }
});
