import { useCookie } from "#imports";

export const useCsrf = () => {
  const csrfToken = useCookie("csrf_token");

  const getHeaders = () => {
    return {
      "x-csrf-token": csrfToken.value || "",
    };
  };

  return {
    csrfToken,
    getHeaders,
  };
};
