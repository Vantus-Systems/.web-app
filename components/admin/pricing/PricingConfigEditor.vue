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
                    placeholder="e.g. 10:30 AM – 12:30 PM"
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
              </div>

              <!-- Vibes / Tags -->
              <div>
                <label class="block mb-2">
                  <span
                    class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                    >Session Vibes</span
                  >
                </label>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(vibe, vibeIndex) in session.vibe ?? []"
                    :key="vibeIndex"
                    class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                  >
                    <input
                      v-model="session.vibe![vibeIndex]"
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

        <!-- Jackpots Section -->
        <div class="space-y-6 pt-8 border-t border-slate-200">
          <div class="flex items-center justify-between">
            <h4 class="text-xl font-black text-primary-900">
              Daytime Jackpots
            </h4>
            <BaseButton
              variant="outline"
              class-name="px-3 py-2 text-xs uppercase tracking-[0.3em]"
              type="button"
              @click="addDaytimeJackpot"
            >
              + Add Jackpot
            </BaseButton>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="(jackpot, index) in draft.daytime?.jackpots ?? []"
              :key="index"
              class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative group"
            >
              <button
                type="button"
                class="absolute top-2 right-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                @click="removeDaytimeJackpot(Number(index))"
              >
                &times;
              </button>
              <div class="space-y-3">
                <input
                  v-model="jackpot.name"
                  placeholder="Jackpot Name"
                  class="w-full font-bold text-primary-900 border-none p-0 focus:ring-0 text-lg placeholder:text-slate-300"
                />
                <input
                  v-model="jackpot.prize"
                  placeholder="Prize Amount"
                  class="w-full text-gold-600 font-bold border-none p-0 focus:ring-0 text-sm placeholder:text-slate-300"
                />
                <input
                  v-model="jackpot.time"
                  placeholder="Draw Time"
                  class="w-full text-xs uppercase tracking-wider text-slate-500 border-none p-0 focus:ring-0 placeholder:text-slate-300"
                />
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

      <!-- Evening Tab -->
      <div
        v-if="activeTab === 'evening'"
        class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div class="grid gap-8 lg:grid-cols-2">
          <div class="space-y-6">
            <h4 class="text-xl font-black text-primary-900">
              Evening Configuration
            </h4>
            <div class="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label class="block">
                <span
                  class="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold"
                  >Session Start Time</span
                >
                <input
                  v-if="draft.evening"
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
                  v-if="draft.evening"
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
                  v-if="draft.evening"
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
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRaw, nextTick } from "vue";
import type { PricingConfig, PricingSession, PricingMachine, PricingJackpot } from "~/types/pricing";
import { Trash2 } from "lucide-vue-next";

const props = defineProps<{
  modelValue: PricingConfig | null;
  isSaving: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

// --- Local Draft Management ---
const isSyncing = ref(false);

const cloneDraft = (value: any): PricingConfig => {
  if (!value || typeof value !== "object") {
    // Return a default empty schema structure if null
    return {
      daytime: {
        sessions: [],
        jackpots: []
      },
      evening: {
        startTime: "6:00 PM",
        valueProposition: "",
        scheduleNote: "",
        machines: []
      }
    };
  }
  const rawValue = toRaw(value);
  return JSON.parse(JSON.stringify(rawValue));
};

const draft = ref<PricingConfig>(cloneDraft(props.modelValue));

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

// Template variables
const tabs = ref([
  { id: 'daytime', name: 'Daytime' },
  { id: 'evening', name: 'Evening' }
]);
const activeTab = ref('daytime');

const daySessionIcons = ['Sun', 'Coffee', 'Clock', 'Calendar', 'Star'];
const machineTypeOptions = ['individual', 'bundle', 'premium'];

const generateId = (prefix: string) => `${prefix}-${Date.now()}`;

const addDaytimeSession = () => {
  if (!draft.value.daytime) draft.value.daytime = { sessions: [], jackpots: [] };
  if (!draft.value.daytime.sessions) draft.value.daytime.sessions = [];
  draft.value.daytime.sessions.push({
    id: generateId('session'),
    name: '',
    timeRange: '',
    icon: 'Clock',
    machines: [],
    paperRules: { minSpend: '', minPaperCards: 1 },
    paperRulesAdvanced: { minSpendAdvanced: '', maxPaperCards: '' },
    vibe: []
  });
};

const removeDaytimeSession = (index: number) => {
  if (draft.value.daytime?.sessions) {
    draft.value.daytime.sessions.splice(index, 1);
  }
};

const getIcon = (iconName: string) => iconName;

const addSessionVibe = (session: PricingSession) => {
  if (!session.vibe) session.vibe = [];
  session.vibe.push('');
};

const removeSessionVibe = (session: PricingSession, index: number) => {
  if (session.vibe) session.vibe.splice(index, 1);
};

const addMachineToSession = (session: PricingSession) => {
  if (!session.machines) session.machines = [];
  session.machines.push({
    description: '',
    price: '',
    type: 'individual',
    savings: ''
  });
};

const removeMachineFromSession = (session: PricingSession, index: number) => {
  if (session.machines) session.machines.splice(index, 1);
};

const addDaytimeJackpot = () => {
  if (!draft.value.daytime) draft.value.daytime = { sessions: [], jackpots: [] };
  if (!draft.value.daytime.jackpots) draft.value.daytime.jackpots = [];
  draft.value.daytime.jackpots.push({
    name: '',
    time: '',
    prize: ''
  });
};

const removeDaytimeJackpot = (index: number) => {
  if (draft.value.daytime?.jackpots) {
    draft.value.daytime.jackpots.splice(index, 1);
  }
};

const addEveningMachine = () => {
  if (!draft.value.evening) draft.value.evening = { machines: [], startTime: '', valueProposition: '', scheduleNote: '' };
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
