import { z } from "zod";
import { readJson, writeJson } from "../utils/storage";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
  website: z.string().optional(), // Honeypot
  turnstileToken: z.string().optional(), // Turnstile token
});

// Simple in-memory rate limiter
const rateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3;

export default defineEventHandler(async (event) => {
  // 1. Rate Limiting
  const ip = getRequestHeader(event, "x-forwarded-for") || "unknown";
  const userRequests = rateLimit.get(ip) || 0;

  // Cleanup old entries
  if (Math.random() < 0.01) rateLimit.clear();

  if (rateLimitResult.limited) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests",
      message: `Please try again in ${rateLimitResult.retryAfter} seconds.`,
    });
  }

  // 2. Read & Validate Body
  const body = await readBody(event);
  const result = contactSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation failed",
      data: result.error.errors,
    });
  }

  // 3. Honeypot Check
  if (result.data.website) {
    return { success: true, message: "Message sent" };
  }

  // 4. Save Message
  const messages = await readJson("messages.json", []);
  const newMessage = {
    id: Date.now().toString(),
    ...result.data,
    date: new Date().toISOString(),
    read: false,
  };
  // Remove honeypot field if present in result.data (zod doesn't remove unknown keys unless stripped, but we defined it as optional)
  delete (newMessage as any).website;

  messages.unshift(newMessage);
  await writeJson("messages.json", messages);

  return {
    success: true,
    message: "Thank you! Your message has been received.",
  };
});
