import { randomBytes } from "crypto";
import { defineEventHandler, readBody, createError, setCookie } from "h3";
import { authService } from "@server/services/auth.service";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("[login] Attempting login for:", body.username);
  const { username, password } = loginSchema.parse(body);

  const user = await authService.getUserByUsername(username);
  if (!user) {
    console.log("[login] User not found:", username);
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  const valid = await authService.verifyPassword(password, user.password_hash);
  if (!valid) {
    console.log("[login] Invalid password for:", username);
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  console.log("[login] Success for:", username);
  // Create session
  const ip = event.node.req.socket.remoteAddress;
  const userAgent = event.node.req.headers["user-agent"];
  const { token, expiresAt } = await authService.createSession(
    user.id,
    ip,
    userAgent,
  );

  // Set cookies
  setCookie(event, "auth_token", token, {
    httpOnly: true,
    // Use bracket notation to avoid bundler inlining NODE_ENV at build time so
    // this check remains runtime-configurable.
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  // Set CSRF token cookie (readable by JS)
  const csrfToken = randomBytes(16).toString("hex");
  setCookie(event, "csrf_token", csrfToken, {
    httpOnly: false, // JS needs to read this
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    expires: expiresAt,
  });

  return {
    success: true,
    user: { id: user.id, username: user.username, role: user.role },
  };
});
