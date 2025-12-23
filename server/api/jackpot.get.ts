export default defineEventHandler((_event) => {
  // In production, this would read from a database, Redis, or a config file updated by an admin.
  // For now, we simulate a "posted" jackpot that is consistent for the session or controlled via config.

  // Example: Read from runtime config if available, or static fallback
  const baseJackpot = 2500;

  // We can add a small deterministic variation based on the day of year to make it look "live" but consistent
  // or just return the static value as requested in Option B.
  // Option B: Static but clearly labeled.

  return {
    value: baseJackpot,
    lastUpdated: new Date().toISOString(),
    currency: "USD",
  };
});
