export const useRateLimit = async (
  event: any,
  limit: number = 5,
  windowSeconds: number = 60,
) => {
  const ip = getRequestHeader(event, "x-forwarded-for") || "unknown";
  const key = `ratelimit:${ip}`;

  // Use Nitro storage (abstracted, works with Redis/FS)
  const storage = useStorage("cache");

  const current = await storage.getItem<{ count: number; start: number }>(key);
  const now = Date.now();

  if (!current) {
    await storage.setItem(key, { count: 1, start: now });
    return { limited: false };
  }

  // Reset if window passed
  if (now - current.start > windowSeconds * 1000) {
    await storage.setItem(key, { count: 1, start: now });
    return { limited: false };
  }

  if (current.count >= limit) {
    return {
      limited: true,
      retryAfter: Math.ceil(
        (windowSeconds * 1000 - (now - current.start)) / 1000,
      ),
    };
  }

  // Increment
  current.count++;
  await storage.setItem(key, current);
  return { limited: false };
};
