<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <BaseCard
      v-for="(progressive, key) in filteredProgressives"
      :key="key"
      class-name="bg-white border border-slate-200 relative overflow-hidden"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-primary-900">
            {{
              progressive.label || (key === "babes" ? "Bingo Babes" : "Hornet")
            }}
          </h3>
          <span
            class="text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            {{ key === "babes" ? "Daytime (4 PM)" : "Session" }}
          </span>
        </div>
      </template>

      <div class="space-y-6">
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
          @click="playNoWinner(key)"
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

    <div class="lg:col-span-2 flex justify-end">
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
import { computed, ref, watch, nextTick, toRaw } from "vue";
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
    return value ?? {};
  }
  const rawValue = toRaw(value);
  return JSON.parse(JSON.stringify(rawValue));
};

const draft = ref(cloneDraft(props.modelValue));

// Filter out non-progressive keys like lastUpdated
const filteredProgressives = computed(() => {
  if (!draft.value) return {};
  const { lastUpdated: _lastUpdated, ...rest } = draft.value;
  return rest;
});

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

const playNoWinner = (key: string) => {
  const progressive = draft.value?.[key];
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
