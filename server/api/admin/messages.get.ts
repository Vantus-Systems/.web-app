import { readJson } from "~/server/utils/storage";
import { requireAuth } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const messages = await readJson("messages.json", []);
  return messages;
});
