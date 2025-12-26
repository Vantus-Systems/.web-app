import { defineEventHandler, createError } from "h3";
import { contactService } from "@server/services/contact.service";

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const messages = await contactService.list();
  return messages;
});
