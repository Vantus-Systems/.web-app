import { useCookie } from "#imports";

export const useCsrf = () => {
  const csrfToken = useCookie("csrf_token");

  const refreshCsrfToken = async () => {
    try {
      await $fetch("/api/auth/user", { credentials: "include" });
    } catch {
      // ignore; token refresh best-effort
    }
    return csrfToken.value || "";
  };

  const getHeaders = () => {
    return {
      "x-csrf-token": csrfToken.value || "",
    };
  };

  return {
    csrfToken,
    getHeaders,
    refreshCsrfToken,
  };
};
