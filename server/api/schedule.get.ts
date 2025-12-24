import { readJson } from "~/server/utils/storage";

export default defineEventHandler(async () => {
  const data = await readJson("schedule.json", []);
  return data;
});
