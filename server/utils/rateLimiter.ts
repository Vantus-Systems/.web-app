/**
 * Rate Limiting Service
 * Simple in-memory rate limiter for critical endpoints
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);
// Ensure this background timer does not keep Node's event loop alive (helps builds/CLI to exit)
cleanupInterval.unref?.();

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export const rateLimiter = {
  /**
   * Check if a key is rate limited
   * @param key - Unique identifier (e.g., IP address, user ID)
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limited
   */
  checkLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      // No entry or expired, create new
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return true;
    }

    if (entry.count >= config.maxAttempts) {
      // Rate limited
      return false;
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);
    return true;
  },

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(key: string, config: RateLimitConfig): number {
    const entry = rateLimitStore.get(key);
    const now = Date.now();

    if (!entry || entry.resetAt < now) {
      return config.maxAttempts;
    }

    return Math.max(0, config.maxAttempts - entry.count);
  },

  /**
   * Get time until reset (in seconds)
   */
  getResetTime(key: string): number | null {
    const entry = rateLimitStore.get(key);
    const now = Date.now();

    if (!entry || entry.resetAt < now) {
      return null;
    }

    return Math.ceil((entry.resetAt - now) / 1000);
  },

  /**
   * Clear rate limit for a key (useful for successful login)
   */
  clearLimit(key: string): void {
    rateLimitStore.delete(key);
  },
};
