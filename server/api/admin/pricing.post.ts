import { writeJson } from "~/server/utils/storage";
import { requireAuth } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const body = await readBody(event);
  await writeJson("pricing.json", body);
  return { success: true };
});
