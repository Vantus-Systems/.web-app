import { defineEventHandler, readBody } from "h3";
import { contactService } from "@server/services/contact.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Zod validation is handled inside the service
  const message = await contactService.create(body);

  return { success: true, id: message.id };
});
