import { defineEventHandler, readBody } from "h3";
import { z } from "zod";
import prisma from "~/server/db/client";
import { assertRole } from "~/server/utils/roles";

const holidayRuleSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1),
    rule_type: z.enum(["FIXED_DATE", "NTH_WEEKDAY", "EASTER"]),
    month: z.number().int().min(1).max(12).optional(),
    day: z.number().int().min(1).max(31).optional(),
    weekday: z.number().int().min(0).max(6).optional(),
    week: z.number().int().min(1).max(5).optional(),
    closure_type: z.enum(["CLOSED", "CLOSE_EARLY"]),
    close_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    start_year: z.number().int().min(2000).max(2100).optional(),
    end_year: z.number().int().min(2000).max(2100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rule_type === "FIXED_DATE" && (!data.month || !data.day)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fixed date rules require month and day.",
      });
    }
    if (
      data.rule_type === "NTH_WEEKDAY" &&
      (!data.month || data.weekday === undefined || !data.week)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nth weekday rules require month, weekday, and week.",
      });
    }
    if (data.closure_type === "CLOSE_EARLY" && !data.close_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Close early rules require close_time.",
      });
    }
  });

export default defineEventHandler(async (event) => {
  assertRole(event.context.user?.role, ["OWNER"]);

  const body = await readBody(event);
  const data = holidayRuleSchema.parse(body);

  const payload = {
    name: data.name,
    rule_type: data.rule_type,
    month: data.month,
    day: data.day,
    weekday: data.weekday,
    week: data.week,
    closure_type: data.closure_type,
    close_time: data.close_time,
    start_year: data.start_year,
    end_year: data.end_year,
  };

  const rule = data.id
    ? await prisma.holidayRule.update({
        where: { id: data.id },
        data: payload,
      })
    : await prisma.holidayRule.create({
        data: payload,
      });

  return rule;
});
