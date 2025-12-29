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
        :selected-type="selected?.type ?? null"
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
import type { OpsSchemaV2 } from "~/types/ops-schema";
import RateCardPalette from "~/components/admin/ops/RateCardPalette.vue";
import TimelineCanvas from "~/components/admin/ops/TimelineCanvas.vue";
import TimelineInspector from "~/components/admin/ops/TimelineInspector.vue";
import { detectGaps } from "~/utils/ops-schema.utils";

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

const gaps = computed(() =>
  detectGaps(
    flowSegments.value,
    draft.value.timeline.operationalHours.start,
    draft.value.timeline.operationalHours.end,
  ),
);

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
  const rateCard = rateCards.value.find(
    (card) => card.id === payload.rateCardId,
  );
  const id = `segment-${Date.now()}`;
  draft.value.timeline.flowSegments.push({
    id,
    label: rateCard?.name ?? "Flow Segment",
    time_start: payload.time_start,
    time_end: payload.time_end,
    rate_card_id: payload.rateCardId,
    color_code: rateCard?.color ?? "#e2e8f0",
  });
  handleSelect({ type: "segment", id });
};

const updateSegmentTime = (payload: {
  id: string;
  time_start: string;
  time_end: string;
}) => {
  const target = flowSegments.value.find(
    (segment) => segment.id === payload.id,
  );
  if (!target) return;
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

const updateRateCard = (updated: any) => {
  const idx = rateCards.value.findIndex((card) => card.id === updated.id);
  if (idx >= 0) draft.value.definitions.rateCards[idx] = updated;
};

const updateSegment = (updated: any) => {
  const idx = flowSegments.value.findIndex(
    (segment) => segment.id === updated.id,
  );
  if (idx >= 0) draft.value.timeline.flowSegments[idx] = updated;
};

const updateOverlay = (updated: any) => {
  const idx = overlayEvents.value.findIndex((event) => event.id === updated.id);
  if (idx >= 0) draft.value.timeline.overlayEvents[idx] = updated;
};

const updateTrigger = (updated: any) => {
  const idx = logicTriggers.value.findIndex(
    (trigger) => trigger.id === updated.id,
  );
  if (idx >= 0) draft.value.logicTriggers[idx] = updated;
};

const removeSelection = (payload: Selected) => {
  if (!payload) return;
  if (payload.type === "rateCard") {
    draft.value.definitions.rateCards = rateCards.value.filter(
      (card) => card.id !== payload.id,
    );
  } else if (payload.type === "segment") {
    draft.value.timeline.flowSegments = flowSegments.value.filter(
      (segment) => segment.id !== payload.id,
    );
  } else if (payload.type === "overlay") {
    draft.value.timeline.overlayEvents = overlayEvents.value.filter(
      (event) => event.id !== payload.id,
    );
  } else {
    draft.value.logicTriggers = logicTriggers.value.filter(
      (trigger) => trigger.id !== payload.id,
    );
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
