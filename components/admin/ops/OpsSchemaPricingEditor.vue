<template>
  <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_320px] h-[720px]">
    <RateCardPalette
      :rate-cards="rateCards"
      :selected-id="selected?.id"
      @select="handleSelect"
      @add="addRateCard"
    />

    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <p
            class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
          >
            Timeline Controls
          </p>
          <h3 class="text-xl font-black text-primary-900">
            Rate Cards + Timeline
          </h3>
        </div>
        <div class="flex gap-2">
          <BaseButton
            variant="outline"
            class-name="text-xs px-3 py-2"
            @click="addOverlayEvent"
          >
            + Overlay
          </BaseButton>
          <BaseButton
            variant="outline"
            class-name="text-xs px-3 py-2"
            @click="addTrigger"
          >
            + Trigger
          </BaseButton>
        </div>
      </div>

      <div
        v-if="error"
        class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
      >
        {{ error }}
      </div>

      <TimelineCanvas
        :flow-segments="flowSegments"
        :overlay-events="overlayEvents"
        :logic-triggers="logicTriggers"
        :rate-cards="rateCards"
        :operational-start="draft.timeline.operationalHours.start"
        :operational-end="draft.timeline.operationalHours.end"
        :density="density"
        :selected-id="selected?.id"
        :selected-type="
          selected?.type === 'rateCard' ? null : (selected?.type ?? null)
        "
        :gaps="gaps"
        @select="handleSelect"
        @add-segment="addSegmentFromDrop"
        @update-segment="updateSegmentTime"
        @error="setError"
        @zoom="handleZoom"
      />
    </div>

    <transition name="slide-fade">
      <TimelineInspector
        v-if="selected"
        :selected="selected"
        :rate-cards="rateCards"
        :flow-segments="flowSegments"
        :overlay-events="overlayEvents"
        :logic-triggers="logicTriggers"
        @update-rate-card="updateRateCard"
        @update-segment="updateSegment"
        @update-overlay="updateOverlay"
        @update-trigger="updateTrigger"
        @delete="removeSelection"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRaw, watch } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import type {
  OpsSchemaV2,
  OpsSchemaRateCard,
  OpsSchemaFlowSegment,
  OpsSchemaOverlayEvent,
  OpsSchemaLogicTrigger,
} from "~/types/ops-schema";
import RateCardPalette from "~/components/admin/ops/RateCardPalette.vue";
import TimelineCanvas from "~/components/admin/ops/TimelineCanvas.vue";
import TimelineInspector from "~/components/admin/ops/TimelineInspector.vue";
import { detectGaps } from "~/utils/ops-schema.utils";

// Helper function to convert time string to minutes
const toMinutes = (time: string): number => {
  const match = time.trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
};

// Validation functions
const isValidTimeFormat = (time: string): boolean => {
  if (!time) return false;
  const match = time.trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return (
    !Number.isNaN(hours) &&
    !Number.isNaN(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
};

const isValidTimeRange = (start: string, end: string): boolean => {
  if (!start || !end) return false;
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  return endMinutes > startMinutes;
};

const isValidColorFormat = (color: string): boolean => {
  if (!color) return false;
  // Support hex colors: #RGB, #RRGGBB, #RRGGBBAA
  const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  return hexPattern.test(color);
};

const isValidBundleIds = (bundleIds: string[]): boolean => {
  // Check if all bundle IDs are valid (non-empty strings)
  return bundleIds.every(
    (id) => typeof id === "string" && id.trim().length > 0,
  );
};

const isValidOperationalHours = (start: string, end: string): boolean => {
  if (!start || !end) return false;
  if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) return false;
  return isValidTimeRange(start, end);
};

const isValidSegmentDuration = (
  start: string,
  end: string,
  minMinutes: number = 15,
): boolean => {
  if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) return false;
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  return endMinutes - startMinutes >= minMinutes;
};

const isValidTriggerTarget = (
  targetId: string | undefined,
  overlayEvents: OpsSchemaOverlayEvent[],
): boolean => {
  if (!targetId) return true; // null/undefined is valid (no target)
  return overlayEvents.some((event) => event.id === targetId);
};

const hasOverlappingSegments = (
  newSegment: {
    time_start: string;
    time_end: string;
    allow_overlap?: boolean;
    id?: string;
  },
  existingSegments: OpsSchemaFlowSegment[],
): boolean => {
  // Check if the new segment overlaps with any existing segments
  for (const segment of existingSegments) {
    // Skip if the segment allows overlap or if it's the same segment being updated
    if (
      segment.allow_overlap ||
      (newSegment.id && segment.id === newSegment.id)
    )
      continue;

    const newStart = toMinutes(newSegment.time_start);
    const newEnd = toMinutes(newSegment.time_end);
    const existingStart = toMinutes(segment.time_start);
    const existingEnd = toMinutes(segment.time_end);

    // Check for overlap: new segment starts before existing ends AND new segment ends after existing starts
    if (newStart < existingEnd && newEnd > existingStart) {
      return true;
    }
  }
  return false;
};

const props = defineProps<{
  modelValue: OpsSchemaV2;
  density: "compact" | "standard" | "detail";
}>();

const emit = defineEmits(["update:modelValue", "update:density"]);

const isSyncing = ref(false);
const cloneDraft = (value: OpsSchemaV2) =>
  JSON.parse(JSON.stringify(toRaw(value)));
const draft = ref(cloneDraft(props.modelValue));

type Selected = {
  type: "rateCard" | "segment" | "overlay" | "trigger";
  id: string;
} | null;
const selected = ref<Selected>(null);
const error = ref("");

const rateCards = computed(() => draft.value.definitions.rateCards ?? []);
const flowSegments = computed(() => draft.value.timeline.flowSegments ?? []);
const overlayEvents = computed(() => draft.value.timeline.overlayEvents ?? []);
const logicTriggers = computed(() => draft.value.logicTriggers ?? []);

const gaps = computed(() => {
  // Validate operational hours before calculating gaps
  const start = draft.value.timeline.operationalHours.start;
  const end = draft.value.timeline.operationalHours.end;

  if (!isValidOperationalHours(start, end)) {
    console.warn("DEBUG: Invalid operational hours:", { start, end });
    setError(
      "Invalid operational hours. Please check the start and end times.",
    );
    return [];
  }

  return detectGaps(flowSegments.value, start, end);
});

const handleSelect = (payload: Selected) => {
  selected.value = payload;
};

const setError = (message: string) => {
  error.value = message;
  setTimeout(() => {
    error.value = "";
  }, 3000);
};

const handleZoom = (delta: number) => {
  const order: Array<"compact" | "standard" | "detail"> = [
    "compact",
    "standard",
    "detail",
  ];
  const currentIndex = order.indexOf(props.density);
  const nextIndex = delta > 0 ? currentIndex - 1 : currentIndex + 1;
  const next = order[Math.max(0, Math.min(order.length - 1, nextIndex))];
  if (next !== props.density) {
    emit("update:density", next);
  }
};

const addRateCard = () => {
  const id = `rate-${Date.now()}`;
  draft.value.definitions.rateCards.push({
    id,
    name: "New Rate Card",
    category: "Standard",
    color: "#64748b",
    yield_configuration: {
      mode: "standard_rate",
      active_bundles: [],
    },
  });
  handleSelect({ type: "rateCard", id });
};

const addSegmentFromDrop = (payload: {
  rateCardId: string;
  time_start: string;
  time_end: string;
}) => {
  console.log("DEBUG: addSegmentFromDrop called with:", payload);

  // Validate time format
  if (
    !isValidTimeFormat(payload.time_start) ||
    !isValidTimeFormat(payload.time_end)
  ) {
    setError("Invalid time format. Expected HH:MM format.");
    return;
  }

  // Validate time range
  if (!isValidTimeRange(payload.time_start, payload.time_end)) {
    setError("Invalid time range. End time must be after start time.");
    return;
  }

  // Validate segment duration minimum
  if (!isValidSegmentDuration(payload.time_start, payload.time_end)) {
    setError("Segment duration too short. Minimum duration is 15 minutes.");
    return;
  }

  // Validate no overlapping segments
  if (hasOverlappingSegments(payload, flowSegments.value)) {
    setError(
      "Segment overlaps with existing segments. Please adjust the time range.",
    );
    return;
  }

  const rateCard = rateCards.value.find(
    (card: OpsSchemaRateCard) => card.id === payload.rateCardId,
  );

  if (!rateCard) {
    console.warn("DEBUG: Rate card not found for ID:", payload.rateCardId);
    setError("Rate card not found. Please select a valid rate card.");
    return;
  }

  const id = `segment-${Date.now()}`;
  draft.value.timeline.flowSegments.push({
    id,
    label: rateCard?.name ?? "Flow Segment",
    time_start: payload.time_start,
    time_end: payload.time_end,
    rate_card_id: payload.rateCardId,
    color_code: rateCard?.color ?? "#e2e8f0",
    allow_overlap: false, // Default value
  });
  handleSelect({ type: "segment", id });
};

const updateSegmentTime = (payload: {
  id: string;
  time_start: string;
  time_end: string;
}) => {
  console.log("DEBUG: updateSegmentTime called with:", payload);

  // Validate time format
  if (
    !isValidTimeFormat(payload.time_start) ||
    !isValidTimeFormat(payload.time_end)
  ) {
    setError("Invalid time format. Expected HH:MM format.");
    return;
  }

  // Validate time range
  if (!isValidTimeRange(payload.time_start, payload.time_end)) {
    setError("Invalid time range. End time must be after start time.");
    return;
  }

  // Validate segment duration minimum
  if (!isValidSegmentDuration(payload.time_start, payload.time_end)) {
    setError("Segment duration too short. Minimum duration is 15 minutes.");
    return;
  }

  // Validate no overlapping segments (excluding the current segment being updated)
  const otherSegments = flowSegments.value.filter(
    (segment: OpsSchemaFlowSegment) => segment.id !== payload.id,
  );
  if (hasOverlappingSegments(payload, otherSegments)) {
    setError(
      "Segment overlaps with existing segments. Please adjust the time range.",
    );
    return;
  }

  const target = flowSegments.value.find(
    (segment: OpsSchemaFlowSegment) => segment.id === payload.id,
  );

  if (!target) {
    console.warn("DEBUG: Segment not found for ID:", payload.id);
    setError("Segment not found. Cannot update time.");
    return;
  }

  target.time_start = payload.time_start;
  target.time_end = payload.time_end;
};

const addOverlayEvent = () => {
  const id = `event-${Date.now()}`;
  draft.value.timeline.overlayEvents.push({
    id,
    label: "Overlay Event",
    time_start: "19:00",
    time_end: "21:00",
    is_hard_ticket: false,
  });
  handleSelect({ type: "overlay", id });
};

const addTrigger = () => {
  const id = `trigger-${Date.now()}`;
  draft.value.logicTriggers.push({
    id,
    trigger_time: "12:00",
    type: "hard_reset",
  });
  handleSelect({ type: "trigger", id });
};

const updateRateCard = (updated: OpsSchemaRateCard) => {
  console.log("DEBUG: updateRateCard called with:", updated);

  // Validate required fields
  if (!updated.name || !updated.id) {
    setError("Rate card must have a name and ID.");
    return;
  }

  // Validate color format
  if (updated.color && !isValidColorFormat(updated.color)) {
    setError("Invalid color format. Expected hex color code.");
    return;
  }

  // Validate bundle IDs
  if (
    updated.yield_configuration?.active_bundles &&
    !isValidBundleIds(updated.yield_configuration.active_bundles)
  ) {
    setError("Invalid bundle IDs. All bundle IDs must be non-empty strings.");
    return;
  }

  const idx = rateCards.value.findIndex(
    (card: OpsSchemaRateCard) => card.id === updated.id,
  );
  if (idx >= 0) {
    draft.value.definitions.rateCards[idx] = updated;
  } else {
    console.warn("DEBUG: Rate card not found for update:", updated.id);
    setError("Rate card not found. Cannot update.");
  }
};

const updateSegment = (updated: OpsSchemaFlowSegment) => {
  console.log("DEBUG: updateSegment called with:", updated);

  // Validate time format
  if (
    !isValidTimeFormat(updated.time_start) ||
    !isValidTimeFormat(updated.time_end)
  ) {
    setError("Invalid time format. Expected HH:MM format.");
    return;
  }

  // Validate time range
  if (!isValidTimeRange(updated.time_start, updated.time_end)) {
    setError("Invalid time range. End time must be after start time.");
    return;
  }

  const idx = flowSegments.value.findIndex(
    (segment: OpsSchemaFlowSegment) => segment.id === updated.id,
  );
  if (idx >= 0) {
    draft.value.timeline.flowSegments[idx] = updated;
  } else {
    console.warn("DEBUG: Segment not found for update:", updated.id);
    setError("Segment not found. Cannot update.");
  }
};

const updateOverlay = (updated: OpsSchemaOverlayEvent) => {
  console.log("DEBUG: updateOverlay called with:", updated);

  // Validate time format
  if (
    !isValidTimeFormat(updated.time_start) ||
    !isValidTimeFormat(updated.time_end)
  ) {
    setError("Invalid time format. Expected HH:MM format.");
    return;
  }

  // Validate time range
  if (!isValidTimeRange(updated.time_start, updated.time_end)) {
    setError("Invalid time range. End time must be after start time.");
    return;
  }

  const idx = overlayEvents.value.findIndex(
    (event: OpsSchemaOverlayEvent) => event.id === updated.id,
  );
  if (idx >= 0) {
    draft.value.timeline.overlayEvents[idx] = updated;
  } else {
    console.warn("DEBUG: Overlay event not found for update:", updated.id);
    setError("Overlay event not found. Cannot update.");
  }
};

const updateTrigger = (updated: OpsSchemaLogicTrigger) => {
  console.log("DEBUG: updateTrigger called with:", updated);

  // Validate time format
  if (!isValidTimeFormat(updated.trigger_time)) {
    setError("Invalid trigger time format. Expected HH:MM format.");
    return;
  }

  // Validate trigger type
  if (!["hard_reset", "sales_window_open"].includes(updated.type)) {
    setError(
      'Invalid trigger type. Must be "hard_reset" or "sales_window_open".',
    );
    return;
  }

  // Validate trigger target event
  if (
    updated.target_event &&
    !isValidTriggerTarget(updated.target_event, overlayEvents.value)
  ) {
    setError("Invalid target event. Target event must exist in the timeline.");
    return;
  }

  const idx = logicTriggers.value.findIndex(
    (trigger: OpsSchemaLogicTrigger) => trigger.id === updated.id,
  );
  if (idx >= 0) {
    draft.value.logicTriggers[idx] = updated;
  } else {
    console.warn("DEBUG: Trigger not found for update:", updated.id);
    setError("Trigger not found. Cannot update.");
  }
};

const removeSelection = (payload: Selected) => {
  console.log("DEBUG: removeSelection called with:", payload);

  if (!payload) {
    console.warn("DEBUG: removeSelection called with null payload");
    setError("No item selected for deletion.");
    return;
  }

  if (payload.type === "rateCard") {
    const initialLength = rateCards.value.length;
    draft.value.definitions.rateCards = rateCards.value.filter(
      (card: OpsSchemaRateCard) => card.id !== payload.id,
    );
    if (rateCards.value.length === initialLength) {
      console.warn("DEBUG: Rate card not found for deletion:", payload.id);
      setError("Rate card not found. Cannot delete.");
    }
  } else if (payload.type === "segment") {
    const initialLength = flowSegments.value.length;
    draft.value.timeline.flowSegments = flowSegments.value.filter(
      (segment: OpsSchemaFlowSegment) => segment.id !== payload.id,
    );
    if (flowSegments.value.length === initialLength) {
      console.warn("DEBUG: Segment not found for deletion:", payload.id);
      setError("Segment not found. Cannot delete.");
    }
  } else if (payload.type === "overlay") {
    const initialLength = overlayEvents.value.length;
    draft.value.timeline.overlayEvents = overlayEvents.value.filter(
      (event: OpsSchemaOverlayEvent) => event.id !== payload.id,
    );
    if (overlayEvents.value.length === initialLength) {
      console.warn("DEBUG: Overlay event not found for deletion:", payload.id);
      setError("Overlay event not found. Cannot delete.");
    }
  } else if (payload.type === "trigger") {
    const initialLength = logicTriggers.value.length;
    draft.value.logicTriggers = logicTriggers.value.filter(
      (trigger: OpsSchemaLogicTrigger) => trigger.id !== payload.id,
    );
    if (logicTriggers.value.length === initialLength) {
      console.warn("DEBUG: Trigger not found for deletion:", payload.id);
      setError("Trigger not found. Cannot delete.");
    }
  } else {
    console.warn("DEBUG: Unknown selection type for deletion:", payload.type);
    setError("Unknown item type. Cannot delete.");
  }
  selected.value = null;
};

watch(
  () => props.modelValue,
  (value) => {
    isSyncing.value = true;
    draft.value = cloneDraft(value);
    nextTick(() => {
      isSyncing.value = false;
    });
  },
  { deep: true, immediate: true },
);

watch(
  draft,
  (value) => {
    if (!isSyncing.value) {
      emit("update:modelValue", cloneDraft(value));
    }
  },
  { deep: true },
);
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
