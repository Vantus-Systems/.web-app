export default defineEventHandler(async (_event) => {
  // Read from Nitro storage (simulating DB/Redis)
  const storage = useStorage("db");
  const jackpot = await storage.getItem("jackpot");

  // Fallback to default if not set
  if (!jackpot) {
    return {
      value: 2500,
      lastUpdated: new Date().toISOString(),
      currency: "USD",
      isDefault: true,
    };
  }

  return jackpot;
});
