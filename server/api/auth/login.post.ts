import crypto from "crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { password } = body;

  // Hardcoded password for this demo.
  // In production, use env variable or proper auth system.

  // Ensure password is a string and matches the length of the actual password for timingSafeEqual
  const actualPassword = "admin123";
  if (
    typeof password === "string" &&
    password.length === actualPassword.length &&
    crypto.timingSafeEqual(
      Buffer.from(password, "utf-8"),
      Buffer.from(actualPassword, "utf-8"),
    )
  ) {
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
