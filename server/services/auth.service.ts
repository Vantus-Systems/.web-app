import { randomBytes, createHash } from "crypto";
import prisma from "@server/db/client";
import * as argon2 from "argon2";

export const authService = {
  verifyPassword(password: string, hash: string) {
    return argon2.verify(hash, password);
  },

  hashPassword(password: string) {
    return argon2.hash(password, { type: argon2.argon2id });
  },

  async createSession(userId: string, ip?: string, userAgent?: string) {
    // Generate a secure random token
    const token = randomBytes(32).toString("hex");
    // Hash it for storage
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await prisma.session.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip,
        user_agent: userAgent,
      },
    });

    return { token, expiresAt };
  },

  async verifySession(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");

    try {
      const session = await prisma.session.findUnique({
        where: { token_hash: tokenHash },
        include: { user: true },
      });

      if (!session || session.expires_at < new Date()) {
        return null;
      }

      return session;
    } catch (error: any) {
      const code = error?.code;
      if (code === "P2021") {
        // Sessions table is missing; log and treat as unauthenticated instead of throwing
        console.error(
          "[auth] verifySession - sessions table missing (P2021). Treating as no session.",
          error,
        );
        return null;
      }
      throw error;
    }
  },

  async revokeSession(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    try {
      await prisma.session.delete({
        where: { token_hash: tokenHash },
      });
    } catch (error: any) {
      const code = error?.code;
      if (code === "P2021") {
        console.error(
          "[auth] revokeSession - sessions table missing (P2021). Ignoring.",
          error,
        );
        return;
      }
      // Ignore if not found or rethrow unexpected errors
      if (code !== "P2025") {
        throw error;
      }
    }
  },

  getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  getUserByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },
};
