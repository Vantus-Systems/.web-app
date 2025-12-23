import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
  website: z.string().optional(), // Honeypot
  turnstileToken: z.string().optional(), // Turnstile token
});

export default defineEventHandler(async (event) => {
  // 1. Storage-based Rate Limiting (Global, persistent)
  const rateLimitResult = await useRateLimit(event, 5, 300); // 5 requests per 5 minutes

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
    // Silently success for bots
    return { success: true, message: "Message sent" };
  }

  // 4. Turnstile Verification
  if (result.data.turnstileToken) {
    const turnstile = await verifyTurnstileToken(result.data.turnstileToken);
    if (!turnstile.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid captcha",
      });
    }
  }

  // 5. Send Email via Service
  const emailResult = await sendEmail({
    to: "info@maryestherbingo.com", // In prod, use env var
    subject: `New Contact from ${result.data.name}`,
    text: `Email: ${result.data.email}\n\nMessage:\n${result.data.message}`,
  });

  if (!emailResult.success) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send message",
    });
  }

  return {
    success: true,
    message: "Thank you! Your message has been received.",
  };
});
