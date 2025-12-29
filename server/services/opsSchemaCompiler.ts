import { createError } from "h3";
import { opsSchemaV2Schema } from "@server/schemas/ops-schema.zod";
import type { OpsSchemaV2 } from "~/types/ops-schema";
import { formatHHMM, parseHHMM } from "~/utils/time.utils";
import { detectOverlaps, normalizeTimeRange } from "~/utils/ops-schema.utils";

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
  const flowSegments = [...schema.timeline.flowSegments].sort(
    (a, b) => parseHHMM(a.time_start) - parseHHMM(b.time_start),
  );
  const bundles = schema.definitions.bundles ?? [];
  const rateCardLookup = new Map(
    schema.definitions.rateCards.map((card) => [card.id, card]),
  );

  const daytimeSessions = flowSegments.map((segment) => {
    const rateCard = rateCardLookup.get(segment.rate_card_id);
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

  const overlayEvents = [...schema.timeline.overlayEvents].sort(
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
  const profiles = schema.dayProfiles ?? [];
  const segments = schema.timeline.flowSegments ?? [];
  const overlays = schema.timeline.overlayEvents ?? [];
  const assignments = schema.calendar.weekdayDefaults ?? {};
  const dateAssignments = schema.calendar.assignments ?? {};
  const overrides = schema.calendar.overrides ?? {};

  const sessions: any[] = [];

  weekDays.forEach((day) => {
    const assignment = assignments[day];
    if (!assignment || assignment.status === "closed") return;
    const profile = profiles.find((p) => p.id === assignment.profile_id);
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

  Object.entries(dateAssignments).forEach(([date, assignment]) => {
    if (!assignment || assignment.status === "closed") return;
    const profile = profiles.find((p) => p.id === assignment.profile_id);
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

  Object.entries(overrides).forEach(([date, entries]) => {
    entries.forEach((entry) => {
      const profile = profiles.find((p) => p.id === entry.profile_id);
      if (!profile) return;
      profile.segment_ids.forEach((segmentId) => {
        const segment = segments.find((seg) => seg.id === segmentId);
        if (!segment) return;
        sessions.push({
          id: `${date}-${segment.id}-${entry.id}`,
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
  const overlaps = detectOverlaps(parsed.timeline.flowSegments);
  if (overlaps.length > 0) {
    throw createError({
      statusCode: 400,
      message: `Flow segments overlap: ${overlaps
        .map((pair) => `${pair.a.label} ↔ ${pair.b.label}`)
        .join(", ")}`,
    });
  }

  const operational = normalizeTimeRange(
    parsed.timeline.operationalHours.start,
    parsed.timeline.operationalHours.end,
  );
  if (operational.start === operational.end) {
    throw createError({
      statusCode: 400,
      message: "Operational hours must span a non-zero duration.",
    });
  }

  return {
    pricing: buildLegacyPricing(parsed, options.previousPricing),
    schedule: buildLegacySchedule(parsed, options.previousSchedule),
  };
};
