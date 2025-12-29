import { opsSchemaV2Schema } from "@server/schemas/ops-schema.zod";
import type { OpsSchemaV2 } from "~/types/ops-schema";
import { formatHHMM, parseHHMM } from "~/utils/time.utils";

type CompilerOptions = {
  previousPricing?: any;
  previousSchedule?: any;
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const normalizeCategory = (label: string) => {
  const value = label.toLowerCase();
  if (value.includes("morning")) return "Morning";
  if (value.includes("afternoon")) return "Afternoon";
  if (value.includes("evening") || value.includes("night")) return "Evening";
  return "Regular";
};

const buildLegacyPricing = (schema: OpsSchemaV2, previousPricing?: any) => {
  const flowSegments = [...schema.timeline_configuration.flow_segments].sort(
    (a, b) => parseHHMM(a.time_start) - parseHHMM(b.time_start),
  );
  const bundles = Object.values(schema.definitions.bundles ?? {});

  const daytimeSessions = flowSegments.map((segment) => {
    const rateCard = schema.definitions.rate_cards?.[segment.rate_card_id];
    return {
      id: segment.id,
      name: segment.label,
      timeRange: `${formatHHMM(segment.time_start)} – ${formatHHMM(
        segment.time_end,
      )}`,
      icon: "clock",
      jackpot: "",
      description: rateCard?.name ? `Rate Card: ${rateCard.name}` : "",
      vibe: [],
      machines: bundles.map((bundle) => ({
        description: bundle.name,
        price: bundle.price ? `$${bundle.price}` : "",
        type: "bundle",
        savings: bundle.discount_label ?? "",
      })),
      paperRules: previousPricing?.daytime?.paperRules ?? {
        minSpend: "$1",
        minPaperCards: 1,
      },
      paperRulesAdvanced: previousPricing?.daytime?.paperRulesAdvanced ?? {
        minSpendAdvanced: "$2+",
        maxPaperCards: "Unlimited",
      },
    };
  });

  const overlayEvents = [...schema.timeline_configuration.overlay_events].sort(
    (a, b) => parseHHMM(a.time_start) - parseHHMM(b.time_start),
  );
  const eveningStart =
    overlayEvents[0]?.time_start ??
    previousPricing?.evening?.startTime ??
    "19:30";

  return {
    daytime: {
      sessions: daytimeSessions,
      jackpots: previousPricing?.daytime?.jackpots ?? [],
    },
    evening: {
      startTime: formatHHMM(eveningStart),
      valueProposition: previousPricing?.evening?.valueProposition ?? "",
      scheduleNote: previousPricing?.evening?.scheduleNote ?? "",
      machines:
        previousPricing?.evening?.machines ??
        bundles.map((bundle) => ({
          description: bundle.name,
          price: bundle.price ? `$${bundle.price}` : "",
          type: "bundle",
          savings: bundle.discount_label ?? "",
        })),
      specialtyGames: previousPricing?.evening?.specialtyGames ?? [],
    },
    sunday: previousPricing?.sunday ?? { title: "", note: "", specials: [] },
    faqs: previousPricing?.faqs ?? [],
  };
};

const buildLegacySchedule = (schema: OpsSchemaV2, previousSchedule?: any) => {
  const profiles = schema.day_profiles ?? [];
  const segments = schema.timeline_configuration.flow_segments ?? [];
  const overlays = schema.timeline_configuration.overlay_events ?? [];
  const assignments = schema.calendar.assignments ?? {};
  const overrides = schema.calendar.overrides ?? {};

  const sessions: any[] = [];

  weekDays.forEach((day) => {
    const profileId = assignments[day];
    if (!profileId) return;
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    profile.segment_ids.forEach((segmentId) => {
      const segment = segments.find((seg) => seg.id === segmentId);
      if (!segment) return;
      sessions.push({
        id: `${day}-${segment.id}`,
        name: segment.label,
        category: normalizeCategory(segment.label),
        startTime: segment.time_start,
        endTime: segment.time_end,
        gameType: "Regular",
        status: "Upcoming",
        overrideDate: undefined,
        availableDays: [day],
        pricing: {},
        specials: {},
        isDraft: false,
        projectedRevenue: 0,
        ticketsSold: 0,
        totalSeats: 100,
        programSlug: "",
        pricingSessionId: segment.rate_card_id,
      });
    });

    profile.overlay_event_ids.forEach((eventId) => {
      const event = overlays.find((ov) => ov.id === eventId);
      if (!event) return;
      sessions.push({
        id: `${day}-${event.id}`,
        name: event.label,
        category: "Evening",
        startTime: event.time_start,
        endTime: event.time_end,
        gameType: "Special",
        status: "Upcoming",
        overrideDate: undefined,
        availableDays: [day],
        pricing: {},
        specials: {},
        isDraft: false,
        projectedRevenue: 0,
        ticketsSold: 0,
        totalSeats: 100,
        programSlug: "",
        pricingSessionId: event.id,
      });
    });
  });

  Object.entries(overrides).forEach(([date, items]) => {
    items.forEach((entry) => {
      const profile = profiles.find((p) => p.id === entry.profile_id);
      if (!profile) return;
      profile.segment_ids.forEach((segmentId) => {
        const segment = segments.find((seg) => seg.id === segmentId);
        if (!segment) return;
        sessions.push({
          id: `${date}-${segment.id}`,
          name: `${segment.label} (Override)`,
          category: normalizeCategory(segment.label),
          startTime: segment.time_start,
          endTime: segment.time_end,
          gameType: "Regular",
          status: "Upcoming",
          overrideDate: date,
          availableDays: [],
          pricing: {},
          specials: {},
          isDraft: false,
          projectedRevenue: 0,
          ticketsSold: 0,
          totalSeats: 100,
          programSlug: "",
          pricingSessionId: segment.rate_card_id,
        });
      });
    });
  });

  if (sessions.length === 0) {
    return Array.isArray(previousSchedule) ? previousSchedule : [];
  }

  return sessions;
};

export const compileOpsSchema = (
  schema: OpsSchemaV2,
  options: CompilerOptions = {},
) => {
  const parsed = opsSchemaV2Schema.parse(schema);

  return {
    pricing: buildLegacyPricing(parsed, options.previousPricing),
    schedule: buildLegacySchedule(parsed, options.previousSchedule),
  };
};
