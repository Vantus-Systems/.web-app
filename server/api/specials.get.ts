import { readJson } from "~/server/utils/storage";

const DEFAULT_SPECIALS = {
  heroNote: "",
  weekly: [],
  meta: {
    timezone: "America/Chicago",
    location: "Mary Esther Bingo • Fort Walton Beach, FL",
  },
};

export default defineEventHandler(async () => {
  const data = await readJson("specials.json", DEFAULT_SPECIALS);
  const timezone = data.meta?.timezone ?? "America/Chicago";
  const todayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: timezone,
  }).format(new Date());
  const today =
    (data.weekly ?? []).find((day: any) => day.day === todayName) ?? null;

  return {
    heroNote: data.heroNote ?? "",
    timezone,
    location:
      data.meta?.location ?? "Mary Esther Bingo • Fort Walton Beach, FL",
    weekly: data.weekly ?? [],
    today,
  };
});
