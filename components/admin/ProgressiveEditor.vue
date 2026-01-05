<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BaseCard
        v-for="(progressive, index) in draft.items || []"
        :key="progressive.id || index"
        class-name="bg-white border border-slate-200 relative overflow-hidden"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <input
              v-model="progressive.label"
              type="text"
              class="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 focus:ring-0 text-lg font-bold text-primary-900 w-full mr-4"
              placeholder="Progressive Name"
            />
            <button
              type="button"
              class="text-slate-400 hover:text-red-500 transition-colors"
              title="Remove Progressive"
              @click="removeProgressive(index)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Configuration Row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Approximate Time
              </label>
              <input
                v-model="progressive.playTime"
                type="text"
                class="block w-full bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="e.g. Daytime (4 PM)"
              />
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Session Play
              </label>
              <div
                class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
              >
                <span class="text-sm font-medium text-slate-700">Played?</span>
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                  :class="
                    progressive.isSession ? 'bg-primary-600' : 'bg-slate-200'
                  "
                  @click="progressive.isSession = !progressive.isSession"
                >
                  <span
                    aria-hidden="true"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="
                      progressive.isSession ? 'translate-x-5' : 'translate-x-0'
                    "
                  ></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Current Amount -->
          <div class="bg-primary-50 p-6 rounded-2xl border border-primary-100">
            <label
              class="block text-xs font-bold text-primary-700 uppercase tracking-wider mb-2"
            >
              Current Progressive
            </label>
            <div class="relative">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary-400"
                >$</span
              >
              <input
                v-model.number="progressive.current"
                type="number"
                step="1"
                class="block w-full bg-white border-2 border-primary-200 rounded-xl text-3xl font-black text-primary-900 pl-10 pr-4 py-3 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
            <div
              class="mt-4 flex items-center justify-between text-xs font-medium text-slate-500"
            >
              <span>Cap: $5,000</span>
              <span
                :class="{
                  'text-green-600 font-bold': progressive.current >= 5000,
                }"
              >
                {{ progressive.current >= 5000 ? "CAPPED" : "Growing" }}
              </span>
            </div>
          </div>

          <!-- Backup Amount -->
          <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
            >
              Backup Amount
            </label>
            <div class="relative">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400"
                >$</span
              >
              <input
                v-model.number="progressive.backup"
                type="number"
                step="1"
                class="block w-full bg-white border border-slate-300 rounded-xl text-xl font-bold text-slate-700 pl-8 pr-4 py-2 focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
              />
            </div>
            <p class="text-xs text-slate-400 mt-2">
              Accumulates after main pot reaches $5,000.
            </p>
          </div>

          <!-- Action Button -->
          <button
            type="button"
            class="w-full bg-primary-900 hover:bg-primary-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            @click="playNoWinner(index)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Session Played - No Winner</span>
          </button>
          <p class="text-xs text-center text-slate-400">
            Adds $100 to the appropriate pot based on rules.
          </p>
        </div>
      </BaseCard>

      <!-- Add New Card -->
      <div
        class="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 transition-all cursor-pointer min-h-[400px]"
        @click="addProgressive"
      >
        <div class="bg-slate-100 rounded-full p-4 mb-4 group-hover:bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <span class="font-bold">Add New Progressive</span>
      </div>
    </div>

    <div class="flex justify-end pt-4 border-t border-slate-200">
      <BaseButton
        variant="gold"
        :disabled="isSaving"
        class-name="px-8 py-4 text-lg shadow-xl shadow-gold/20"
        @click="$emit('save')"
      >
        <span v-if="isSaving">Saving...</span>
        <span v-else>Save Changes</span>
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, toRaw } from "vue";
import BaseCard from "~/components/ui/BaseCard.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

const props = defineProps<{
  modelValue: any;
  isSaving: boolean;
}>();

const emit = defineEmits(["update:modelValue", "save"]);

const isSyncing = ref(false);

const cloneDraft = (value: any) => {
  if (!value || typeof value !== "object") {
    return { items: [] };
  }
  const rawValue = toRaw(value);
  // Ensure items array exists
  if (!rawValue.items) {
    return { ...rawValue, items: [] };
  }
  return JSON.parse(JSON.stringify(rawValue));
};

const draft = ref(cloneDraft(props.modelValue));

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

const addProgressive = () => {
  if (!draft.value.items) draft.value.items = [];
  draft.value.items.push({
    id: crypto.randomUUID(),
    label: "New Progressive",
    current: 0,
    backup: 0,
    playTime: "",
    isSession: false,
  });
};

const removeProgressive = (index: number) => {
  if (confirm("Are you sure you want to remove this progressive?")) {
    draft.value.items.splice(index, 1);
  }
};

const playNoWinner = (index: number) => {
  const progressive = draft.value.items[index];
  if (!progressive) return;

  if (progressive.current < 5000) {
    // Increase current, cap at 5000, overflow to backup
    const nextVal = progressive.current + 100;
    if (nextVal > 5000) {
      const overflow = nextVal - 5000;
      progressive.current = 5000;
      progressive.backup += overflow;
    } else {
      progressive.current = nextVal;
    }
  } else {
    // Already capped, add to backup
    progressive.backup += 100;
  }
};
</script>
