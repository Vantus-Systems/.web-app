import { defineEventHandler } from "h3";
import { contactService } from "@server/services/contact.service";
import { assertRole } from "~/server/utils/roles";

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const messages = await contactService.list();
  return messages;
});
