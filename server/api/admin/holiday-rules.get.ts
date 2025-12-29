import { defineEventHandler, getQuery } from "h3";
import { z } from "zod";
import { assertRole } from "~/server/utils/roles";
import {
  getHolidayOccurrencesForYear,
  seedDefaultHolidayRules,
} from "~/server/services/holidayRules.service";

const querySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
});

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER", "MIC", "CHARITY"]);

  await seedDefaultHolidayRules();

  const query = querySchema.parse(getQuery(event));
  const year = query.year ? Number(query.year) : new Date().getUTCFullYear();

  const data = await getHolidayOccurrencesForYear(year);
  return { ...data, year };
});
