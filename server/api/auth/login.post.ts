export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { password } = body;

  // Hardcoded password for this demo.
  // In production, use env variable or proper auth system.
  if (password === "admin123") {
    // Set a cookie
    setCookie(event, "auth_token", "valid_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return { success: true };
  }

  throw createError({
    statusCode: 401,
    statusMessage: "Invalid password",
  });
});
