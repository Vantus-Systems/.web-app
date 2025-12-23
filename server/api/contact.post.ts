import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
  // Honeypot field - should be empty
  website: z.string().optional(),
});

// Simple in-memory rate limiter (for demo purposes)
// In production, use Redis or Nuxt Security module
const rateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3;

export default defineEventHandler(async (event) => {
  // 1. Rate Limiting
  const ip = getRequestHeader(event, "x-forwarded-for") || "unknown";
  // const now = Date.now();
  const userRequests = rateLimit.get(ip) || 0;

  // Cleanup old entries (simplistic garbage collection)
  if (Math.random() < 0.01) rateLimit.clear();

  if (userRequests >= MAX_REQUESTS) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests. Please try again later.",
    });
  }
  rateLimit.set(ip, userRequests + 1);
  setTimeout(() => rateLimit.delete(ip), RATE_LIMIT_WINDOW);

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

  // 3. Spam Check (Honeypot)
  if (result.data.website) {
    // Silently fail for bots
    return { success: true, message: "Message sent" };
  }

  // 4. Send Email (Stub)
  // In production: await sendEmail({ to: 'info@maryestherbingo.com', ... })
  // console.log('Sending email from:', result.data.email);

  return {
    success: true,
    message: "Thank you! Your message has been received.",
  };
});
