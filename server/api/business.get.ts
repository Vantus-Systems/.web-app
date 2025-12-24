import { readJson } from "../utils/storage";

export default defineEventHandler(async () => {
  const data = await readJson("business.json", {});
  return data;
});
