import crypto from "crypto";

export default defineEventHandler((event) => {
  const token = getCookie(event, "auth_token");
  const expected = "valid_token";
  // Ensure both are strings and compare length before using timingSafeEqual
  if (
    typeof token === "string" &&
    Buffer.byteLength(token, "utf-8") === Buffer.byteLength(expected, "utf-8")
  ) {
    const tokenBuf = Buffer.from(token, "utf-8");
    const expectedBuf = Buffer.from(expected, "utf-8");
    if (crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      return { user: { username: "admin" } };
    }
  }

  throw createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
});
