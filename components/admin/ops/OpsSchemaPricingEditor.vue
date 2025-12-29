<template>
  <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
    <BaseCard class-name="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Rate Cards
          </p>
          <h3 class="text-lg font-black text-primary-900">Library</h3>
        </div>
        <BaseButton variant="outline" class-name="text-xs px-3 py-2" @click="addRateCard">
          + Add
        </BaseButton>
      </div>

      <div class="space-y-2">
        <button
          v-for="card in rateCards"
          :key="card.id"
          class="w-full text-left rounded-xl border px-3 py-3 transition"
          :class="selected?.type === 'rateCard' && selected?.id === card.id
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-200 bg-white hover:border-slate-300'"
          @click="selectItem('rateCard', card.id)"
        >
          <p class="text-sm font-bold text-primary-900">{{ card.name }}</p>
          <p class="text-[10px] uppercase tracking-widest text-slate-400">
            {{ card.yield_configuration.mode }}
          </p>
        </button>
      </div>
    </BaseCard>

    <BaseCard class-name="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Timeline
          </p>
          <h3 class="text-xl font-black text-primary-900">Flow Segments</h3>
        </div>
        <BaseButton variant="outline" class-name="text-xs px-3 py-2" @click="addFlowSegment">
          + Add Segment
        </BaseButton>
      </div>

      <div class="space-y-3">
        <div
          v-for="segment in flowSegments"
          :key="segment.id"
          class="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="space-y-1">
              <p class="text-sm font-bold text-primary-900">{{ segment.label }}</p>
              <p class="text-xs text-slate-500">
                {{ segment.time_start }} → {{ segment.time_end }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="text-xs font-bold text-primary-700 hover:text-primary-900"
                @click="selectItem('segment', segment.id)"
              >
                Inspect
              </button>
              <button
                class="text-xs font-bold text-rose-500 hover:text-rose-600"
                @click="removeFlowSegment(segment.id)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-100 pt-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
              Overlay Events
            </p>
            <h3 class="text-lg font-black text-primary-900">Sessions Layer</h3>
          </div>
          <BaseButton variant="outline" class-name="text-xs px-3 py-2" @click="addOverlayEvent">
            + Add Event
          </BaseButton>
        </div>

        <div class="space-y-3">
          <div
            v-for="event in overlayEvents"
            :key="event.id"
            class="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="space-y-1">
                <p class="text-sm font-bold text-primary-900">{{ event.label }}</p>
                <p class="text-xs text-slate-500">
                  {{ event.time_start }} → {{ event.time_end }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="text-xs font-bold text-primary-700 hover:text-primary-900"
                  @click="selectItem('overlay', event.id)"
                >
                  Inspect
                </button>
                <button
                  class="text-xs font-bold text-rose-500 hover:text-rose-600"
                  @click="removeOverlayEvent(event.id)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard class-name="p-4 space-y-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Inspector
        </p>
        <h3 class="text-lg font-black text-primary-900">
          {{ inspectorTitle }}
        </h3>
      </div>

      <div v-if="selectedItem" class="space-y-4">
        <div v-if="selected?.type === 'rateCard'">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Rate Card Name
          </label>
          <input
            v-model="selectedItem.name"
            class="w-full rounded-lg border-slate-200 bg-slate-50"
          />
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">
            Yield Mode
          </label>
          <select
            v-model="selectedItem.yield_configuration.mode"
            class="w-full rounded-lg border-slate-200 bg-slate-50"
          >
            <option value="fixed_rate">Fixed Rate</option>
            <option value="standard_rate">Standard Rate</option>
            <option value="reduced_rate">Reduced Rate</option>
          </select>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">
            Active Bundles (comma separated)
          </label>
          <input
            v-model="rateCardBundlesInput"
            class="w-full rounded-lg border-slate-200 bg-slate-50"
          />
        </div>

        <div v-else-if="selected?.type === 'segment'">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Segment Label
          </label>
          <input v-model="selectedItem.label" class="w-full rounded-lg border-slate-200 bg-slate-50" />
          <div class="grid grid-cols-2 gap-3 mt-4">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Start
              <input v-model="selectedItem.time_start" class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50" />
            </label>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              End
              <input v-model="selectedItem.time_end" class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50" />
            </label>
          </div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">
            Rate Card
          </label>
          <select v-model="selectedItem.rate_card_id" class="w-full rounded-lg border-slate-200 bg-slate-50">
            <option value="">Select</option>
            <option v-for="card in rateCards" :key="card.id" :value="card.id">
              {{ card.name }}
            </option>
          </select>
        </div>

        <div v-else-if="selected?.type === 'overlay'">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Event Label
          </label>
          <input v-model="selectedItem.label" class="w-full rounded-lg border-slate-200 bg-slate-50" />
          <div class="grid grid-cols-2 gap-3 mt-4">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Start
              <input v-model="selectedItem.time_start" class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50" />
            </label>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              End
              <input v-model="selectedItem.time_end" class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50" />
            </label>
          </div>
          <div class="flex items-center gap-2 mt-4">
            <input id="hard-ticket" v-model="selectedItem.is_hard_ticket" type="checkbox" class="rounded" />
            <label for="hard-ticket" class="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hard Ticket
            </label>
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-slate-400">
        Select a rate card, segment, or overlay event to inspect.
      </p>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRaw, watch } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseCard from "~/components/ui/BaseCard.vue";
import type { OpsSchemaV2 } from "~/types/ops-schema";

const props = defineProps<{
  modelValue: OpsSchemaV2;
}>();

const emit = defineEmits(["update:modelValue"]);

const isSyncing = ref(false);
const cloneDraft = (value: OpsSchemaV2) => JSON.parse(JSON.stringify(toRaw(value)));
const draft = ref(cloneDraft(props.modelValue));

type Selected = { type: "rateCard" | "segment" | "overlay"; id: string } | null;
const selected = ref<Selected>(null);

const rateCards = computed(() =>
  Object.values(draft.value.definitions.rate_cards ?? {}),
);
const flowSegments = computed(() => draft.value.timeline_configuration.flow_segments ?? []);
const overlayEvents = computed(() => draft.value.timeline_configuration.overlay_events ?? []);

const selectedItem = computed(() => {
  if (!selected.value) return null;
  if (selected.value.type === "rateCard") {
    return draft.value.definitions.rate_cards[selected.value.id];
  }
  if (selected.value.type === "segment") {
    return flowSegments.value.find((segment) => segment.id === selected.value?.id);
  }
  return overlayEvents.value.find((event) => event.id === selected.value?.id);
});

const inspectorTitle = computed(() => {
  if (!selected.value) return "No Selection";
  if (selected.value.type === "rateCard") return "Rate Card";
  if (selected.value.type === "segment") return "Flow Segment";
  return "Overlay Event";
});

const rateCardBundlesInput = computed({
  get: () =>
    selectedItem.value?.yield_configuration?.active_bundles?.join(", ") ?? "",
  set: (value: string) => {
    if (!selectedItem.value) return;
    selectedItem.value.yield_configuration.active_bundles = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  },
});

const selectItem = (type: Selected["type"], id: string) => {
  selected.value = { type, id };
};

const addRateCard = () => {
  const id = `rate-${Date.now()}`;
  draft.value.definitions.rate_cards[id] = {
    id,
    name: "New Rate Card",
    yield_configuration: {
      mode: "standard_rate",
      active_bundles: [],
    },
  };
  selectItem("rateCard", id);
};

const addFlowSegment = () => {
  const id = `segment-${Date.now()}`;
  draft.value.timeline_configuration.flow_segments.push({
    id,
    label: "New Segment",
    time_start: "10:00",
    time_end: "12:00",
    rate_card_id: rateCards.value[0]?.id ?? "",
    color_code: "#0f172a",
  });
  selectItem("segment", id);
};

const addOverlayEvent = () => {
  const id = `event-${Date.now()}`;
  draft.value.timeline_configuration.overlay_events.push({
    id,
    label: "New Event",
    time_start: "19:00",
    time_end: "21:00",
    is_hard_ticket: false,
  });
  selectItem("overlay", id);
};

const removeFlowSegment = (id: string) => {
  draft.value.timeline_configuration.flow_segments =
    flowSegments.value.filter((segment) => segment.id !== id);
  if (selected.value?.id === id) selected.value = null;
};

const removeOverlayEvent = (id: string) => {
  draft.value.timeline_configuration.overlay_events =
    overlayEvents.value.filter((event) => event.id !== id);
  if (selected.value?.id === id) selected.value = null;
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
