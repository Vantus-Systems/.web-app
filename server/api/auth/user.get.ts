export default defineEventHandler((event) => {
  const token = getCookie(event, "auth_token");
  if (token === "valid_token") {
    return { user: { username: "admin" } };
  }

  throw createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
});
