import { z } from "zod";

export const homepageSchema = z.object({
  hero: z.object({
    headline: z
      .string()
      .default("FLORIDA’S PREMIER HIGH-STAKES BINGO DESTINATION"),
    subheadline: z
      .string()
      .default(
        "Experience the thrill of big payouts in a state-of-the-art facility. Your winning moment is waiting.",
      ),
    primaryCta: z.object({
      label: z.string().default("PLAN YOUR VISIT"),
      href: z.string().default("/schedule"),
    }),
    secondaryCta: z
      .object({
        label: z.string().default("View VIP Packages & Pricing"),
        href: z.string().default("/pricing"),
      })
      .optional(),
    videoUrl: z.string().optional(),
    posterUrl: z.string().optional(),
    showVideo: z.boolean().default(true),
  }),
  ticker: z.object({
    enabled: z.boolean().default(true),
    items: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      )
      .default([]),
    asOfDate: z.string().optional(),
  }),
  statsBar: z.object({
    enabled: z.boolean().default(true),
    items: z
      .array(
        z.object({
          big: z.string(),
          small: z.string(),
          note: z.string().optional(),
        }),
      )
      .default([]),
    asOfDate: z.string().optional(),
  }),
  prizePool: z.object({
    enabled: z.boolean().default(true),
    tonightTotalLabel: z.string().default("Tonight's Total Prize Pool"),
    tonightTotalValue: z.string().default("$25,000+"),
    note: z.string().optional(),
    asOfDate: z.string().optional(),
  }),
  winners: z.object({
    enabled: z.boolean().default(true),
    items: z
      .array(
        z.object({
          name: z.string(),
          amount: z.string(),
          date: z.string().optional(),
          quote: z.string().optional(),
          photoUrl: z.string().optional(),
        }),
      )
      .default([]),
  }),
  mission: z.object({
    headline: z.string().default("PLAY WITH PURPOSE"),
    body: z
      .string()
      .default(
        "We are a volunteer-supported charity bingo hall. Every game you play supports local community programs.",
      ),
    tagline: z.string().default("Win Big. Do Good."),
  }),
});

export type HomepageSettings = z.infer<typeof homepageSchema>;
