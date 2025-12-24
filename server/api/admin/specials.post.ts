import { createError } from "h3";
import { z } from "zod";

import { writeJson } from "~/server/utils/storage";
import { requireAuth } from "~/server/utils/auth";

const specialsSchema = z.object({
  heroNote: z.string().optional(),
  weekly: z
    .array(
      z.object({
        day: z.string(),
        title: z.string(),
        description: z.string().optional(),
        time: z.string().optional(),
        offers: z.array(z.string()).optional(),
        note: z.string().optional(),
      }),
    )
    .min(1),
  meta: z
    .object({
      timezone: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
});

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const body = await readBody(event);
  const parsed = specialsSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid specials payload",
    });
  }

  const payload = {
    heroNote: parsed.data.heroNote,
    weekly: parsed.data.weekly,
    meta: {
      timezone: parsed.data.meta?.timezone ?? "America/Chicago",
      location:
        parsed.data.meta?.location ??
        "Mary Esther Bingo • Fort Walton Beach, FL",
    },
  };

  await writeJson("specials.json", payload);
  return { success: true };
});
