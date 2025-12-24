import { readJson } from "~/server/utils/storage";

export default defineEventHandler(async () => {
  const pricing = await readJson("pricing.json", {});
  return pricing;
});
