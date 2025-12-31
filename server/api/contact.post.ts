import { defineEventHandler, readBody, createError } from "h3";
import { contactService } from "@server/services/contact.service";
import { rateLimiter } from "@server/utils/rateLimiter";

export default defineEventHandler(async (event) => {
  // Rate limiting: 3 submissions per 10 minutes per IP
  const ip = event.node.req.socket.remoteAddress || "unknown";
  const rateLimitKey = `contact:${ip}`;

  if (
    !rateLimiter.checkLimit(rateLimitKey, {
      maxAttempts: 3,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    const resetTime = rateLimiter.getResetTime(rateLimitKey);
    throw createError({
      statusCode: 429,
      message: `Too many contact form submissions. Try again in ${resetTime} seconds.`,
    });
  }

  const body = await readBody(event);

  // Zod validation is handled inside the service
  const message = await contactService.create(body);

  return { success: true, id: message.id };
});
