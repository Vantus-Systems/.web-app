import { createError } from "h3";
import { opsSchemaV2Schema } from "../schemas/ops-schema.zod";
import type {
  OpsSchemaV2,
  OpsSchemaDayProfile,
  OpsSchemaFlowSegment,
  OpsSchemaOverlayEvent,
} from "../../types/ops-schema";
import { formatHHMM } from "../../utils/time.utils";
import {
  detectOverlaps,
  normalizeRangeToOperational,
  toOperationalMinutes,
} from "../../utils/ops-schema.utils";

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

// Helper to process a profile on a date
export const processProfile = (
  profile: OpsSchemaDayProfile,
  context: {
    segments: OpsSchemaFlowSegment[];
    overlays: OpsSchemaOverlayEvent[];
  },
  date: string,
  overrideId?: string,
  overrideNote?: string,
) => {
  const sessions: any[] = [];

  // Flow Segments
  profile.segment_ids.forEach((segmentId) => {
    const segment = context.segments.find((seg) => seg.id === segmentId);
    if (!segment) return;
    sessions.push({
      id: overrideId
        ? `${date}-${segment.id}-${overrideId}`
        : `${date}-${segment.id}`,
      name: overrideNote ? `${segment.label} (${overrideNote})` : segment.label,
      category: normalizeCategory(segment.label),
      startTime: segment.time_start,
      endTime: segment.time_end,
      gameType: "Regular",
      status: "Upcoming",
      overrideDate: overrideId ? date : undefined,
      availableDays: overrideId
        ? []
        : [new Date(date).toLocaleDateString("en-US", { weekday: "short" })], // Approximation
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

  // Overlay Events
  profile.overlay_event_ids.forEach((eventId) => {
    const event = context.overlays.find((ov) => ov.id === eventId);
    if (!event) return;
    sessions.push({
      id: overrideId
        ? `${date}-${event.id}-${overrideId}`
        : `${date}-${event.id}`,
      name: overrideNote ? `${event.label} (${overrideNote})` : event.label,
      category: "Evening", // Default or derive?
      startTime: event.time_start,
      endTime: event.time_end,
      gameType: event.is_hard_ticket ? "Special" : "Regular",
      status: "Upcoming",
      overrideDate: overrideId ? date : undefined,
      availableDays: overrideId
        ? []
        : [new Date(date).toLocaleDateString("en-US", { weekday: "short" })],
      pricing: event.pricing_override || {},
      specials: {},
      isDraft: false,
      projectedRevenue: 0,
      ticketsSold: 0,
      totalSeats: 100,
      programSlug: "",
      pricingSessionId: event.id,
    });
  });

  return sessions;
};

const buildLegacyPricing = (schema: OpsSchemaV2, previousPricing?: any) => {
  const opStart = schema.timeline.operationalHours.start;
  const flowSegments = [...schema.timeline.flowSegments].sort(
    (a, b) =>
      toOperationalMinutes(a.time_start, opStart) -
      toOperationalMinutes(b.time_start, opStart),
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
    (a, b) =>
      toOperationalMinutes(a.time_start, opStart) -
      toOperationalMinutes(b.time_start, opStart),
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
  const context = { segments, overlays };

  // Weekday Defaults
  weekDays.forEach((day) => {
    const assignment = assignments[day];
    if (!assignment || assignment.status === "closed") return;
    if (assignment.profile_id) {
      const profile = profiles.find((p) => p.id === assignment.profile_id);
      if (profile) {
        sessions.push(...processProfile(profile, context, "RECURRING-" + day));
      }
    }
  });

  // Date Assignments
  Object.entries(dateAssignments).forEach(([date, assignment]) => {
    if (assignment.status === "closed") return; // Explicit close
    if (assignment.profile_id) {
      const profile = profiles.find((p) => p.id === assignment.profile_id);
      if (profile) {
        sessions.push(...processProfile(profile, context, date));
      }
    }
  });

  // Overrides
  Object.entries(overrides).forEach(([date, entries]) => {
    entries.forEach((entry) => {
      // If LOCKED or CLOSED, we might not want to emit sessions?
      if (entry.kind === "CLOSED" || entry.kind === "LOCKED") return;

      // If PROFILE_SWAP or generic profile_id
      const effectiveKind =
        entry.kind || (entry.profile_id ? "PROFILE_SWAP" : null);

      if (effectiveKind === "PROFILE_SWAP" && entry.profile_id) {
        const profile = profiles.find((p) => p.id === entry.profile_id);
        if (profile) {
          sessions.push(
            ...processProfile(
              profile,
              context,
              date,
              entry.id,
              entry.reason || "Override",
            ),
          );
        }
      }
    });
  });

  if (sessions.length === 0) {
    return Array.isArray(previousSchedule) ? previousSchedule : [];
  }

  // Sort sessions by time
  return sessions.sort((a, b) => {
    const tA = toOperationalMinutes(
      a.startTime,
      schema.timeline.operationalHours.start,
    );
    const tB = toOperationalMinutes(
      b.startTime,
      schema.timeline.operationalHours.start,
    );
    return tA - tB;
  });
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

  const operational = normalizeRangeToOperational(
    parsed.timeline.operationalHours.start,
    parsed.timeline.operationalHours.end,
    parsed.timeline.operationalHours.start,
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
