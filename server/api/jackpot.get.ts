import { readJson } from "../utils/storage";

export default defineEventHandler(async (_event) => {
  const jackpotData = await readJson("jackpot.json", {
    value: 2500,
    lastUpdated: new Date().toISOString(),
  });

  return {
    value: jackpotData.value,
    lastUpdated: jackpotData.lastUpdated,
    currency: "USD",
  };
});
