import { z } from "zod";

const jackpotSchema = z.object({
  value: z.number().min(0),
  currency: z.string().default("USD"),
});

export default defineEventHandler(async (event) => {
  // 1. Auth Check
  const config = useRuntimeConfig();
  const authHeader = getRequestHeader(event, "Authorization");

  if (authHeader !== `Bearer ${config.adminToken}`) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  // 2. Validate Body
  const body = await readBody(event);
  const result = jackpotSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation failed",
      data: result.error.errors,
    });
  }

  // 3. Update Storage
  const storage = useStorage("db");
  const newData = {
    value: result.data.value,
    currency: result.data.currency,
    lastUpdated: new Date().toISOString(),
  };

  await storage.setItem("jackpot", newData);

  return { success: true, data: newData };
});
