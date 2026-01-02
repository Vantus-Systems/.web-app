import assert from "assert";
import { opsSchemaV2Schema } from "../server/schemas/ops-schema.zod";
import { processProfile } from "../server/services/opsSchemaCompiler";
import {
  addDays,
  resolveEffectiveAssignment,
} from "../utils/schedule-calendar";

console.log("Running Ops Schema Verification...");

// 1. Validate Override Schema
try {
  console.log("Testing Override Schema...");
  const validSchema = {
    schema_version: "2.0.0",
    meta: {
      name: "Test",
      status: "draft",
      currency: "USD",
      timezone: "UTC",
      schema_version: "2.0.0",
    },
    definitions: { inventoryTiers: [], bundles: [], rateCards: [] },
    timeline: {
      operationalHours: { start: "09:00", end: "17:00", isOpen: true },
      flowSegments: [],
      overlayEvents: [],
    },
    logicTriggers: [],
    dayProfiles: [
      {
        id: "p1",
        name: "Standard Day",
        category: "weekday",
        segment_ids: [],
        overlay_event_ids: [],
      },
    ],
    calendar: {
      range: { start: "2023-01-01", end: "2023-01-01" },
      weekdayDefaults: {
        Sun: { status: "open", profile_id: "p1" },
      },
      assignments: {},
      overrides: {
        "2023-01-01": [
          {
            id: "123",
            kind: "DOORS_OPEN",
            doors_open_time: "18:00",
            reason: "Special Event",
          },
        ],
      },
    },
  };

  const result = opsSchemaV2Schema.safeParse(validSchema);
  if (!result.success) {
    console.error(JSON.stringify(result.error, null, 2));
    process.exit(1);
  }
  // @ts-ignore
  const override = result.data.calendar.overrides["2023-01-01"]?.[0];
  assert.strictEqual(override?.doors_open_time, "18:00");
  console.log("✅ Override Schema passed.");
} catch (e) {
  console.error("❌ Override Schema failed:", e);
  process.exit(1);
}

// 2. Validate Compiler Overlay Processing
try {
  console.log("Testing Compiler Overlay Processing...");
  const profile = {
    id: "p1",
    name: "Test Profile",
    category: "special",
    segment_ids: ["s1"],
    overlay_event_ids: ["e1"],
  };

  const context = {
    segments: [
      {
        id: "s1",
        label: "Seg 1",
        time_start: "10:00",
        time_end: "11:00",
        rate_card_id: "r1",
      },
    ],
    overlays: [
      {
        id: "e1",
        label: "Evt 1",
        time_start: "12:00",
        time_end: "13:00",
        is_hard_ticket: false,
      },
    ],
  };

  // @ts-ignore
  const result = processProfile(profile, context, "2023-01-01");
  assert.strictEqual(result.length, 2);
  assert.ok(result.find((s) => s.id.includes("e1")));
  console.log("✅ Compiler Overlay passed.");
} catch (e) {
  console.error("❌ Compiler Overlay failed:", e);
  process.exit(1);
}

// 3. Validate Date Math
try {
  console.log("Testing Date Math...");
  const start = "2023-01-01";
  const next = addDays(start, 1);
  assert.strictEqual(next, "2023-01-02");

  const endOfMonth = "2023-01-31";
  const nextMonth = addDays(endOfMonth, 1);
  assert.strictEqual(nextMonth, "2023-02-01");
  console.log("✅ Date Math passed.");
} catch (e) {
  console.error("❌ Date Math failed:", e);
  process.exit(1);
}

// 4. Validate Effective Assignment
try {
  console.log("Testing Effective Assignment...");
  const calendar = {
    range: { start: "2023-01-01", end: "2023-12-31" },
    weekdayDefaults: {},
    assignments: {},
    overrides: {
      "2023-01-01": [{ id: "1", kind: "DOORS_OPEN", doors_open_time: "18:00" }],
    },
  };

  // @ts-ignore
  const result = resolveEffectiveAssignment(calendar, "2023-01-01");
  assert.strictEqual(result.doorsOpenTime, "18:00");
  console.log("✅ Effective Assignment passed.");
} catch (e) {
  console.error("❌ Effective Assignment failed:", e);
  process.exit(1);
}

console.log("🎉 ALL TESTS PASSED");
