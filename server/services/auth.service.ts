import prisma from '@server/db/client'
import * as argon2 from 'argon2'
import { randomBytes, createHash } from 'crypto'

export const authService = {
  async verifyPassword(password: string, hash: string) {
    return argon2.verify(hash, password)
  },

  async hashPassword(password: string) {
    return argon2.hash(password, { type: argon2.argon2id })
  },

  async createSession(userId: string, ip?: string, userAgent?: string) {
    // Generate a secure random token
    const token = randomBytes(32).toString('hex')
    // Hash it for storage
    const tokenHash = createHash('sha256').update(token).digest('hex')

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

    await prisma.session.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip,
        user_agent: userAgent,
      },
    })

    return { token, expiresAt }
  },

  async verifySession(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex')

    const session = await prisma.session.findUnique({
      where: { token_hash: tokenHash },
      include: { user: true },
    })

    if (!session || session.expires_at < new Date()) {
      return null
    }

    return session
  },

  async revokeSession(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex')
    try {
      await prisma.session.delete({
        where: { token_hash: tokenHash },
      })
    } catch {
      // Ignore if not found
    }
  },

  async getUserById(id: string) {
      return prisma.user.findUnique({ where: { id }})
  },

  async getUserByUsername(username: string) {
      return prisma.user.findUnique({ where: { username }})
  }
}
