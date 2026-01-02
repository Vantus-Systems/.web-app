<template>
  <div class="space-y-8">
    <BaseCard class-name="space-y-6">
      <template #header>
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p
              class="text-gold font-bold text-xs uppercase tracking-[0.4em] mb-1"
            >
              Pricing Command Center
            </p>
            <h3 class="text-3xl font-black text-primary-950">
              Enterprise Pricing Matrix
            </h3>
            <p class="text-sm text-slate-500">
              Curate the session tiers, jackpot drops, and premium bundles with
              surgical precision.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <BaseButton
              variant="gold"
              class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
              type="button"
              :disabled="isSaving"
              @click="$emit('save')"
            >
              <span v-if="isSaving">Deploying...</span>
              <span v-else>Deploy Pricing Schema</span>
            </BaseButton>
          </div>
        </div>
      </template>

      <!-- Sub-tabs for Pricing Categories -->
      <div class="border-b border-slate-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-gold text-primary-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm uppercase tracking-wider',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Daytime Tab -->
      <div
        v-if="activeTab === 'daytime'"
        class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-xl font-black text-primary-900">Daytime Sessions</h4>
          <BaseButton
            variant="outline"
            class-name="px-3 py-2 text-xs uppercase tracking-[0.3em]"
            type="button"
            @click="addDaytimeSession"
          >
            + Add Session
          </BaseButton>
        </div>

        <div class="space-y-6">
          <article
            v-for="(session, index) in draft.daytime?.sessions ?? []"
            :key="session.id ?? index"
            class="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm transition hover:shadow-md"
          >
            <div
              class="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-4"
            >
              <div class="flex items-center gap-3">
                <div class="bg-primary-50 p-2 rounded-lg text-gold-600">
                  <component :is="getIcon(session.icon)" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-base font-black text-primary-900">
                    {{ session.name || "Untitled Session" }}
                  </p>
                  <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {{ session.timeRange || "Time TBD" }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="text-xs font-bold text-rose-600 hover:text-rose-700 border border-rose-100 bg-rose-50 px-3 py-1 rounded-full"
                @click="removeDaytimeSession(Number(index))"
              >
                Remove Session
              </button>
            </div>

            <div class="grid gap-6 sm:grid-cols-2">
              <div class="space-y-4">
                <label class="block">
                  <span
                    class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                    >Session Name</span
                  >
                  <input
                    v-model="session.name"
                    type="text"
                    class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                  />
                </label>
                <label class="block">
                  <span
                    class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                    >Time Range</span
                  >
                  <input
                    v-model="session.timeRange"
                    type="text"
                    class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                  />
                </label>
                <label class="block">
                  <span
                    class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                    >Icon</span
                  >
                  <select
                    v-model="session.icon"
                    class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                  >
                    <option
                      v-for="icon in daySessionIcons"
                      :key="icon"
                      :value="icon"
                    >
                      {{ icon }}
                    </option>
                  </select>
                </label>
                <label class="block">
                  <span
                    class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                    >Description</span
                  >
                  <textarea
                    v-model="session.description"
                    rows="2"
                    class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                  ></textarea>
                </label>
              </div>

              <div class="space-y-4">
                <label class="block">
                  <span
                    class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                    >Jackpot Spot</span
                  >
                  <input
                    v-model="session.jackpot"
                    type="text"
                    class="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                    placeholder="$250 Hourly"
                  />
                </label>

                <div class="block">
                  <span
                    class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold block mb-2"
                    >Vibe Tags</span
                  >
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(vibe, vibeIndex) in session.vibe ?? []"
                      :key="`${session.id}-vibe-${vibeIndex}`"
                      class="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      <input
                        v-model="session.vibe[vibeIndex]"
                        type="text"
                        class="w-20 bg-transparent text-xs border-none p-0 focus:ring-0"
                      />
                      <button
                        type="button"
                        class="text-slate-400 hover:text-rose-500"
                        @click="removeSessionVibe(session, Number(vibeIndex))"
                      >
                        &times;
                      </button>
                    </span>
                    <button
                      type="button"
                      class="text-xs font-bold uppercase tracking-[0.3em] text-primary-600 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100"
                      @click="addSessionVibe(session)"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Machine Packages -->
            <div class="mt-6 pt-6 border-t border-slate-100">
              <div class="flex items-center justify-between mb-4">
                <h5
                  class="text-sm font-bold text-primary-900 uppercase tracking-wider"
                >
                  Machine Packages
                </h5>
                <BaseButton
                  variant="outline"
                  class-name="px-2 py-1 text-[10px] uppercase tracking-[0.3em]"
                  type="button"
                  @click="addMachineToSession(session)"
                >
                  Add Tier
                </BaseButton>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(machine, machineIndex) in session.machines ?? []"
                  :key="`${session.id}-machine-${machineIndex}`"
                  class="grid gap-2 md:grid-cols-12 items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
                >
                  <div class="md:col-span-4">
                    <input
                      v-model="machine.description"
                      placeholder="Description"
                      class="w-full text-sm bg-white border-slate-200 rounded-lg"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <input
                      v-model="machine.price"
                      placeholder="Price"
                      class="w-full text-sm bg-white border-slate-200 rounded-lg"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <select
                      v-model="machine.type"
                      class="w-full text-sm bg-white border-slate-200 rounded-lg"
                    >
                      <option
                        v-for="type in machineTypeOptions"
                        :key="type"
                        :value="type"
                      >
                        {{ type }}
                      </option>
                    </select>
                  </div>
                  <div class="md:col-span-3">
                    <input
                      v-model="machine.savings"
                      placeholder="Savings note"
                      class="w-full text-sm bg-white border-slate-200 rounded-lg"
                    />
                  </div>
                  <div class="md:col-span-1 text-right">
                    <button
                      type="button"
                      class="text-rose-500 hover:text-rose-700"
                      @click="
                        removeMachineFromSession(session, Number(machineIndex))
                      "
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Paper Rules Configuration -->
            <div class="mt-6 pt-6 border-t border-slate-100">
              <h5
                class="text-sm font-bold text-primary-900 uppercase tracking-wider mb-4"
              >
                Paper Rules
              </h5>
              <div class="grid gap-4 md:grid-cols-2">
                <!-- Basic Rule -->
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-500"
                    >Basic Spend Threshold</label
                  >
                  <input
                    v-model="session.paperRules.minSpend"
                    placeholder="e.g. $1+"
                    class="w-full text-sm border-slate-200 rounded-lg"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-500"
                    >Free Cards (Basic)</label
                  >
                  <input
                    v-model.number="session.paperRules.minPaperCards"
                    type="number"
                    placeholder="1"
                    class="w-full text-sm border-slate-200 rounded-lg"
                  />
                </div>
                <!-- Advanced Rule -->
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-500"
                    >Advanced Spend Threshold</label
                  >
                  <input
                    v-model="session.paperRulesAdvanced.minSpendAdvanced"
                    placeholder="e.g. $2+"
                    class="w-full text-sm border-slate-200 rounded-lg"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-xs font-bold text-slate-500"
                    >Max Cards (Advanced)</label
                  >
                  <input
                    v-model="session.paperRulesAdvanced.maxPaperCards"
                    placeholder="e.g. Unlimited"
                    class="w-full text-sm border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Daytime Jackpots -->
        <div
          class="bg-primary-950 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-32 -mt-32"
          ></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gold">Daytime Jackpots</h4>
              <button
                class="text-xs bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1 rounded-full uppercase tracking-wider font-bold transition"
                @click="addDaytimeJackpot"
              >
                + Add Jackpot
              </button>
            </div>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="(jackpot, index) in draft.daytime?.jackpots ?? []"
                :key="`jackpot-${index}`"
                class="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 backdrop-blur-sm"
              >
                <input
                  v-model="jackpot.name"
                  class="w-full bg-black/20 border-white/10 rounded-lg text-white placeholder-white/30 text-sm font-bold"
                  placeholder="Jackpot Name"
                />
                <input
                  v-model="jackpot.prize"
                  class="w-full bg-black/20 border-white/10 rounded-lg text-gold placeholder-gold/30 text-lg font-black"
                  placeholder="$ Prize"
                />
                <input
                  v-model="jackpot.time"
                  class="w-full bg-black/20 border-white/10 rounded-lg text-white/70 placeholder-white/20 text-xs"
                  placeholder="Time Window"
                />
                <div class="flex justify-end">
                  <button
                    class="text-xs text-rose-400 hover:text-rose-300"
                    @click="removeDaytimeJackpot(Number(index))"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Evening Tab -->
      <div
        v-if="activeTab === 'evening'"
        class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div class="grid lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <h4 class="text-lg font-black text-primary-900">
              Evening Configuration
            </h4>
            <div class="space-y-4">
              <label class="block">
                <span
                  class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                  >Start Time</span
                >
                <input
                  v-model="draft.evening.startTime"
                  type="text"
                  class="mt-1 w-full rounded-xl border-slate-200 bg-slate-50"
                />
              </label>
              <label class="block">
                <span
                  class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                  >Value Prop</span
                >
                <textarea
                  v-model="draft.evening.valueProposition"
                  rows="2"
                  class="mt-1 w-full rounded-xl border-slate-200 bg-slate-50"
                ></textarea>
              </label>
              <label class="block">
                <span
                  class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                  >Schedule Note</span
                >
                <textarea
                  v-model="draft.evening.scheduleNote"
                  rows="2"
                  class="mt-1 w-full rounded-xl border-slate-200 bg-slate-50"
                ></textarea>
              </label>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-black text-primary-900">
                Evening Bundles
              </h4>
              <button
                class="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-bold"
                @click="addEveningMachine"
              >
                + Add Bundle
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="(machine, index) in draft.evening?.machines ?? []"
                :key="`evening-machine-${index}`"
                class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <input
                    v-model="machine.description"
                    placeholder="Description"
                    class="text-sm border-slate-200 rounded-lg"
                  />
                  <input
                    v-model="machine.price"
                    placeholder="Price"
                    class="text-sm border-slate-200 rounded-lg font-bold text-primary-700"
                  />
                </div>
                <div class="flex justify-between items-center">
                  <select
                    v-model="machine.type"
                    class="text-xs border-slate-200 rounded-lg py-1"
                  >
                    <option value="individual">Individual</option>
                    <option value="bundle">Bundle</option>
                    <option value="premium">Premium</option>
                  </select>
                  <button
                    class="text-xs text-rose-500 font-bold"
                    @click="removeEveningMachine(Number(index))"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="isSaving"
            class="text-xs font-bold text-slate-400 animate-pulse"
            >SAVING...</span
          >
          <button
            class="px-4 py-2 bg-primary-900 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-primary-800 transition"
            @click="$emit('save')"
          >
            Deploy Pricing Schema
          </button>
        </div>
      </div>

      <!-- Main Workspace -->
      <div class="flex-1 flex overflow-hidden">
        <!-- LEFT: Library -->
        <div class="w-64 shrink-0 flex flex-col">
          <RateCardLibrary
            :rate-cards="draft.definitions.rateCards"
            :bundles="draft.definitions.bundles"
            :selected-id="selection?.id"
            @select="handleSelect"
            @add-rate-card="addRateCard"
            @add-bundle="addBundle"
          />
        </div>

        <!-- CENTER: Timeline -->
        <div class="flex-1 border-r border-slate-200 flex flex-col min-w-0">
          <TimelineGantt
            :flow-segments="legacyFlowSegments"
            :overlay-events="legacyOverlayEvents"
            :selected-id="selection?.id"
            @select="handleSelect"
            @add-flow-segment="addFlowSegment"
            @add-overlay-event="addOverlayEvent"
          />
        </div>

        <!-- RIGHT: Inspector -->
        <div class="w-80 shrink-0 bg-white">
          <InspectorPanel
            :item="selectedItem"
            :type="selection?.type"
            :all-rate-cards="draft.definitions.rateCards"
            @update="handleUpdate"
            @delete="handleDelete"
          />
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRaw, nextTick } from "vue";
import RateCardLibrary from "./pricing/RateCardLibrary.vue";
import TimelineGantt from "./pricing/TimelineGantt.vue";
import InspectorPanel from "./pricing/InspectorPanel.vue";
import type { OpsSchemaV2 } from "~/types/ops-schema";

// Extend type to allow legacy properties for backward compatibility
type ExtendedOpsSchema = OpsSchemaV2 & {
  daytime?: any;
  evening?: any;
};

const props = defineProps<{
  modelValue: ExtendedOpsSchema | null;
  isSaving: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

// --- Local Draft Management ---
const isSyncing = ref(false);

const cloneDraft = (value: any): ExtendedOpsSchema => {
  if (!value || typeof value !== "object") {
    // Return a default empty schema structure if null
    return {
      schema_version: "2.0",
      meta: {
        name: "New Schema",
        status: "draft",
        currency: "USD",
        timezone: "America/New_York",
        schema_version: "2.0",
      },
      definitions: { rateCards: [], bundles: [], inventoryTiers: [] },
      timeline: {
        operationalHours: { start: "09:00", end: "23:00", isOpen: true },
        flowSegments: [],
        overlayEvents: [],
      },
      logicTriggers: [],
      dayProfiles: [],
      calendar: {
        range: { start: "", end: "" },
        weekdayDefaults: {},
        assignments: {},
        overrides: {},
      },
    };
  }
  const rawValue = toRaw(value);
  return JSON.parse(JSON.stringify(rawValue));
};

const draft = ref<ExtendedOpsSchema>(cloneDraft(props.modelValue));

const syncDraftFromProps = (value: any) => {
  isSyncing.value = true;
  draft.value = cloneDraft(value);
  nextTick(() => {
    isSyncing.value = false;
  });
};

watch(
  () => props.modelValue,
  (value) => {
    // Only sync from props if we are not actively editing (or if it's a remote update)
    // Here we rely on the parent not bouncing back the same object reference constantly.
    // If opsStore.updateOpsSchemaDraft replaces the reference, this fires.
    // We check JSON string equality to avoid unnecessary updates if needed, but deep watch does that.
    syncDraftFromProps(value);
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

// --- Selection Management ---
const selection = ref<{
  type: "rateCard" | "bundle" | "flowSegment" | "overlayEvent";
  id: string;
} | null>(null);

const handleSelect = (sel: { type: any; id: string }) => {
  selection.value = sel;
};

const selectedItem = computed(() => {
  if (!selection.value) return null;
  const { type, id } = selection.value;
  if (type === "rateCard")
    return draft.value.definitions.rateCards.find((x) => x.id === id);
  if (type === "bundle")
    return draft.value.definitions.bundles.find((x) => x.id === id);
  if (type === "flowSegment")
    return draft.value.timeline.flowSegments.find(
      (x: any) => x.id === id,
    );
  if (type === "overlayEvent")
    return draft.value.timeline.overlayEvents.find(
      (x: any) => x.id === id,
    );
  return null;
});

// --- Actions ---

const generateId = (prefix: string) => `${prefix}-${Date.now()}`;

// Transform OpsSchemaV2 data to legacy format for TimelineGantt component
const legacyFlowSegments = computed(() => {
  return draft.value.timeline.flowSegments.map((seg: any) => ({
    ...seg,
    name: seg.label,
    startTime: seg.time_start,
    endTime: seg.time_end,
  }));
});

const legacyOverlayEvents = computed(() => {
  return draft.value.timeline.overlayEvents.map((evt: any) => ({
    ...evt,
    name: evt.label,
    startTime: evt.time_start,
    endTime: evt.time_end,
  }));
});

const addRateCard = () => {
  const id = generateId("rc");
  draft.value.definitions.rateCards.push({
    id,
    name: "New Rate Card",
    category: "Regular",
    yield_configuration: {
      mode: "standard_rate",
      active_bundles: [],
    },
  });
  handleSelect({ type: "rateCard", id });
};

const addBundle = () => {
  const id = generateId("bn");
  draft.value.definitions.bundles.push({
    id,
    name: "New Bundle",
    price: 0,
    items: [],
  });
  handleSelect({ type: "bundle", id });
};

const addFlowSegment = () => {
  const id = generateId("fs");
  draft.value.timeline.flowSegments.push({
    id,
    label: "New Segment",
    time_start: "10:00",
    time_end: "12:00",
    rate_card_id: "",
  });
  handleSelect({ type: "flowSegment", id });
};

const addOverlayEvent = () => {
  const id = generateId("oe");
  draft.value.timeline.overlayEvents.push({
    id,
    label: "New Event",
    time_start: "19:00",
    time_end: "19:30",
    is_hard_ticket: false,
  });
  handleSelect({ type: "overlayEvent", id });
};

const handleUpdate = ({ type, data }: { type: string; data: any }) => {
  // Update the item in the draft
  if (type === "rateCard") {
    const idx = draft.value.definitions.rateCards.findIndex(
      (x) => x.id === data.id,
    );
    if (idx !== -1) draft.value.definitions.rateCards[idx] = data;
  } else if (type === "bundle") {
    const idx = draft.value.definitions.bundles.findIndex(
      (x) => x.id === data.id,
    );
    if (idx !== -1) draft.value.definitions.bundles[idx] = data;
  } else if (type === "flowSegment") {
    const idx = draft.value.timeline.flowSegments.findIndex(
      (x: any) => x.id === data.id,
    );
    if (idx !== -1) draft.value.timeline.flowSegments[idx] = data;
  } else if (type === "overlayEvent") {
    const idx = draft.value.timeline.overlayEvents.findIndex(
      (x: any) => x.id === data.id,
    );
    if (idx !== -1) draft.value.timeline.overlayEvents[idx] = data;
  }
  // draft watcher will emit update
};

const handleDelete = ({ type, id }: { type: string; id: string }) => {
  if (confirm("Are you sure you want to delete this item?")) {
    if (type === "rateCard") {
      draft.value.definitions.rateCards =
        draft.value.definitions.rateCards.filter((x) => x.id !== id);
    } else if (type === "bundle") {
      draft.value.definitions.bundles = draft.value.definitions.bundles.filter(
        (x) => x.id !== id,
      );
    } else if (type === "flowSegment") {
      draft.value.timeline.flowSegments =
        draft.value.timeline.flowSegments.filter(
          (x: any) => x.id !== id,
        );
    } else if (type === "overlayEvent") {
      draft.value.timeline.overlayEvents =
        draft.value.timeline.overlayEvents.filter(
          (x: any) => x.id !== id,
        );
    }
    selection.value = null;
  }
};

// Template variables for daytime/evening tabs (legacy pricing structure)
const tabs = ref([
  { id: 'daytime', name: 'Daytime' },
  { id: 'evening', name: 'Evening' }
]);
const activeTab = ref('daytime');

const daySessionIcons = ['Sun', 'Coffee', 'Clock', 'Calendar', 'Star'];
const machineTypeOptions = ['individual', 'bundle', 'premium'];

const addDaytimeSession = () => {
  if (!draft.value.daytime) draft.value.daytime = { sessions: [], jackpots: [] } as any;
  if (!draft.value.daytime.sessions) draft.value.daytime.sessions = [];
  draft.value.daytime.sessions.push({
    id: generateId('session'),
    name: '',
    timeRange: '',
    icon: 'Clock',
    description: '',
    jackpot: '',
    vibe: [],
    machines: [],
    paperRules: { minSpend: '', minPaperCards: 1 },
    paperRulesAdvanced: { minSpendAdvanced: '', maxPaperCards: '' }
  });
};

const removeDaytimeSession = (index: number) => {
  if (draft.value.daytime?.sessions) {
    draft.value.daytime.sessions.splice(index, 1);
  }
};

const getIcon = (iconName: string) => iconName;

const addSessionVibe = (session: any) => {
  if (!session.vibe) session.vibe = [];
  session.vibe.push('');
};

const removeSessionVibe = (session: any, index: number) => {
  if (session.vibe) session.vibe.splice(index, 1);
};

const addMachineToSession = (session: any) => {
  if (!session.machines) session.machines = [];
  session.machines.push({
    description: '',
    price: '',
    type: 'individual',
    savings: ''
  });
};

const removeMachineFromSession = (session: any, index: number) => {
  if (session.machines) session.machines.splice(index, 1);
};

const addDaytimeJackpot = () => {
  if (!draft.value.daytime) draft.value.daytime = { sessions: [], jackpots: [] } as any;
  if (!draft.value.daytime.jackpots) draft.value.daytime.jackpots = [];
  draft.value.daytime.jackpots.push({
    name: '',
    prize: '',
    time: ''
  });
};

const removeDaytimeJackpot = (index: number) => {
  if (draft.value.daytime?.jackpots) {
    draft.value.daytime.jackpots.splice(index, 1);
  }
};

const addEveningMachine = () => {
  if (!draft.value.evening) draft.value.evening = { machines: [], startTime: '', valueProposition: '', scheduleNote: '' } as any;
  if (!draft.value.evening.machines) draft.value.evening.machines = [];
  draft.value.evening.machines.push({
    description: '',
    price: '',
    type: 'individual'
  });
};

const removeEveningMachine = (index: number) => {
  if (draft.value.evening?.machines) {
    draft.value.evening.machines.splice(index, 1);
  }
};
</script>
