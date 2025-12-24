import { writeJson } from "~/server/utils/storage";

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const body = await readBody(event);
  await writeJson("schedule.json", body);
  return { success: true };
});
