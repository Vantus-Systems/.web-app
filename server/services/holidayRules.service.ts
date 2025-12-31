import prisma from "~/server/db/client";

export type HolidayOccurrence = {
  date: string;
  name: string;
  closureType: "CLOSED" | "CLOSE_EARLY";
  closeTime?: string | null;
  ruleId: string;
};

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const easterSunday = (year: number) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March,4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
};

const nthWeekdayOfMonth = (
  year: number,
  month: number,
  weekday: number,
  week: number,
) => {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = first.getUTCDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  const day = 1 + offset + (week - 1) * 7;
  return new Date(Date.UTC(year, month - 1, day));
};

export const getHolidayOccurrencesForYear = async (year: number) => {
  const rules = await prisma.holidayRule.findMany();
  const occurrences: HolidayOccurrence[] = [];

  rules.forEach((rule) => {
    if (rule.start_year && year < rule.start_year) return;
    if (rule.end_year && year > rule.end_year) return;

    let date: Date | null = null;
    if (rule.rule_type === "EASTER") {
      date = easterSunday(year);
    }
    if (rule.rule_type === "FIXED_DATE" && rule.month && rule.day) {
      date = new Date(Date.UTC(year, rule.month - 1, rule.day));
    }
    if (
      rule.rule_type === "NTH_WEEKDAY" &&
      rule.month &&
      rule.weekday !== null &&
      rule.week
    ) {
      date = nthWeekdayOfMonth(year, rule.month, rule.weekday, rule.week);
    }

    if (!date) return;
    occurrences.push({
      date: formatDate(date),
      name: rule.name,
      closureType: rule.closure_type as "CLOSED" | "CLOSE_EARLY",
      closeTime: rule.close_time,
      ruleId: rule.id,
    });
  });

  return { rules, occurrences };
};

export const seedDefaultHolidayRules = async () => {
  const defaults = [
    {
      name: "Easter",
      rule_type: "EASTER",
      closure_type: "CLOSED",
    },
    {
      name: "Thanksgiving",
      rule_type: "NTH_WEEKDAY",
      month: 11,
      weekday: 4, // Thursday (0=Sun)
      week: 4,
      closure_type: "CLOSED",
    },
    {
      name: "Christmas Eve",
      rule_type: "FIXED_DATE",
      month: 12,
      day: 24,
      closure_type: "CLOSE_EARLY",
      close_time: "17:00",
    },
    {
      name: "Christmas",
      rule_type: "FIXED_DATE",
      month: 12,
      day: 25,
      closure_type: "CLOSED",
    },
  ];

  await Promise.all(
    defaults.map((rule) =>
      prisma.holidayRule.upsert({
        where: { name: rule.name },
        update: rule,
        create: rule,
      }),
    ),
  );
};
