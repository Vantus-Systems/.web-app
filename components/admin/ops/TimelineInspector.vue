<template>
  <div class="h-full bg-white border-l border-slate-200 p-4 space-y-4">
    <div>
      <p
        class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold"
      >
        Inspector
      </p>
      <h3 class="text-lg font-black text-primary-900">
        {{ title }}
      </h3>
    </div>

    <div v-if="selectedItem" class="space-y-4">
      <div v-if="selected?.type === 'rateCard'">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
        >
          Name
        </label>
        <input
          v-model="draft.name"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        />
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1"
        >
          Category
        </label>
        <input
          v-model="draft.category"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        />
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1"
        >
          Color
        </label>
        <input
          :value="draft.color || '#000000'"
          @input="draft.color = ($event.target as HTMLInputElement).value"
          type="color"
          class="w-12 h-10 border-0 bg-transparent"
        />
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1"
        >
          Yield Mode
        </label>
        <select
          v-model="draft.yield_configuration.mode"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        >
          <option value="fixed_rate">Fixed Rate</option>
          <option value="standard_rate">Standard Rate</option>
          <option value="reduced_rate">Reduced Rate</option>
        </select>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1"
        >
          Active Bundles
        </label>
        <input
          v-model="bundleInput"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
          placeholder="bundle-1, bundle-2"
        />
      </div>

      <div v-else-if="selected?.type === 'segment'">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
        >
          Label
        </label>
        <input
          v-model="draft.label"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        />
        <div class="grid grid-cols-2 gap-3 mt-3">
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Start
            <input
              v-model="draft.time_start"
              class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            />
          </label>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            End
            <input
              v-model="draft.time_end"
              class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            />
          </label>
        </div>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1"
        >
          Rate Card
        </label>
        <select
          v-model="draft.rate_card_id"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        >
          <option value="">Select</option>
          <option v-for="card in rateCards" :key="card.id" :value="card.id">
            {{ card.name }}
          </option>
        </select>
      </div>

      <div v-else-if="selected?.type === 'overlay'">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
        >
          Label
        </label>
        <input
          v-model="draft.label"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        />
        <div class="grid grid-cols-2 gap-3 mt-3">
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Start
            <input
              v-model="draft.time_start"
              class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            />
          </label>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            End
            <input
              v-model="draft.time_end"
              class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            />
          </label>
        </div>
        <div class="flex items-center gap-2 mt-3">
          <input
            id="hard-ticket"
            v-model="draft.is_hard_ticket"
            type="checkbox"
            class="rounded"
          />
          <label
            for="hard-ticket"
            class="text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            Hard Ticket
          </label>
        </div>
      </div>

      <div v-else-if="selected?.type === 'trigger'">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
        >
          Trigger Time
        </label>
        <input
          v-model="draft.trigger_time"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        />
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1"
        >
          Type
        </label>
        <select
          v-model="draft.type"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        >
          <option value="hard_reset">Hard Reset</option>
          <option value="sales_window_open">Sales Window</option>
        </select>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-3 mb-1"
        >
          Target Event
        </label>
        <select
          v-model="draft.target_event"
          class="w-full rounded-lg border-slate-200 bg-slate-50"
        >
          <option value="">None</option>
          <option
            v-for="event in overlayEvents"
            :key="event.id"
            :value="event.id"
          >
            {{ event.label }}
          </option>
        </select>
      </div>

      <div
        class="flex justify-between items-center pt-2 border-t border-slate-100"
      >
        <button
          class="text-xs font-bold text-slate-500 hover:text-slate-700"
          @click="emitUpdate"
        >
          Apply
        </button>
        <button
          class="text-xs font-bold text-rose-500 hover:text-rose-600"
          @click="emitDelete"
        >
          Delete
        </button>
      </div>
    </div>

    <p v-else class="text-sm text-slate-400">
      Select a card, segment, overlay, or trigger to inspect.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  OpsSchemaFlowSegment,
  OpsSchemaLogicTrigger,
  OpsSchemaOverlayEvent,
  OpsSchemaRateCard,
} from "~/types/ops-schema";

type Selection = {
  type: "rateCard" | "segment" | "overlay" | "trigger";
  id: string;
} | null;

const props = defineProps<{
  selected: Selection;
  rateCards: OpsSchemaRateCard[];
  flowSegments: OpsSchemaFlowSegment[];
  overlayEvents: OpsSchemaOverlayEvent[];
  logicTriggers: OpsSchemaLogicTrigger[];
}>();

const emit = defineEmits<{
  (e: "update-rate-card", payload: OpsSchemaRateCard): void;
  (e: "update-segment", payload: OpsSchemaFlowSegment): void;
  (e: "update-overlay", payload: OpsSchemaOverlayEvent): void;
  (e: "update-trigger", payload: OpsSchemaLogicTrigger): void;
  (e: "delete", payload: Selection): void;
}>();

const selectedItem = computed(() => {
  if (!props.selected) return null;
  if (props.selected.type === "rateCard") {
    return (
      props.rateCards.find((item) => item.id === props.selected?.id) ?? null
    );
  }
  if (props.selected.type === "segment") {
    return (
      props.flowSegments.find((item) => item.id === props.selected?.id) ?? null
    );
  }
  if (props.selected.type === "overlay") {
    return (
      props.overlayEvents.find((item) => item.id === props.selected?.id) ?? null
    );
  }
  return (
    props.logicTriggers.find((item) => item.id === props.selected?.id) ?? null
  );
});

const title = computed(() => {
  if (!props.selected) return "No Selection";
  if (props.selected.type === "rateCard") return "Rate Card";
  if (props.selected.type === "segment") return "Flow Segment";
  if (props.selected.type === "overlay") return "Overlay Event";
  return "Trigger";
});

const draft = ref<any>(null);
const bundleInput = computed({
  get: () => draft.value?.yield_configuration?.active_bundles?.join(", ") ?? "",
  set: (value: string) => {
    if (!draft.value?.yield_configuration) return;
    draft.value.yield_configuration.active_bundles = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  },
});

watch(
  () => selectedItem.value,
  (value) => {
    draft.value = value ? JSON.parse(JSON.stringify(value)) : null;
  },
  { immediate: true },
);

const emitUpdate = () => {
  if (!props.selected || !draft.value) return;
  if (props.selected.type === "rateCard") {
    emit("update-rate-card", draft.value);
  } else if (props.selected.type === "segment") {
    emit("update-segment", draft.value);
  } else if (props.selected.type === "overlay") {
    emit("update-overlay", draft.value);
  } else {
    emit("update-trigger", draft.value);
  }
};

const emitDelete = () => {
  if (!props.selected) return;
  emit("delete", props.selected);
};
</script>
