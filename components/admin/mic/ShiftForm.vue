<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label
        class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
      >
        Date
        <input
          v-model="draft.date"
          type="date"
          class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
        />
      </label>
      <label
        class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
      >
        Shift
        <select
          v-model="draft.shift"
          class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          :disabled="noShifts"
        >
          <option v-for="option in shifts" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <span v-if="shiftHint" class="mt-1 block text-[11px] text-slate-400">
          {{ shiftHint }}
        </span>
      </label>
      <label
        class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
      >
        Workflow
        <select
          v-model="draft.workflow_type"
          class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
        >
          <option value="NORMAL">Normal Shift</option>
          <option value="NEGATIVE_BINGO_BOX">Negative Bingo / Box</option>
          <option value="RECUPERATION_BOX_RETURN">Recuperation Shift</option>
        </select>
      </label>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label
        class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
      >
        Pull Tabs Total
        <input
          v-model.number="draft.pulltabs_total"
          type="number"
          min="0"
          step="0.01"
          class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
        />
      </label>
      <label
        class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
      >
        Deposit
        <input
          v-model.number="draft.deposit_total"
          type="number"
          min="0"
          step="0.01"
          class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
          :disabled="depositLocked"
        />
      </label>
      <label
        class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
      >
        Players
        <input
          v-model.number="draft.players"
          type="number"
          min="0"
          step="1"
          class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
        />
      </label>
    </div>

    <div
      v-if="draft.workflow_type === 'NEGATIVE_BINGO_BOX'"
      class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3"
    >
      <div class="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
        Box Reconciliation
      </div>
      <label
        class="block text-xs font-bold text-amber-700 uppercase tracking-wider"
      >
        Beginning Box
        <input
          v-model.number="draft.beginning_box"
          type="number"
          min="0"
          step="0.01"
          class="mt-1 w-full rounded-lg border-amber-200 bg-white"
        />
      </label>
      <label
        class="block text-xs font-bold text-amber-700 uppercase tracking-wider"
      >
        Ending Box (≤ 4000)
        <input
          v-model.number="draft.ending_box"
          type="number"
          min="0"
          max="4000"
          step="0.01"
          class="mt-1 w-full rounded-lg border-amber-200 bg-white"
        />
      </label>
      <div class="flex items-center gap-2 text-xs text-amber-700">
        <input
          id="deposit-override"
          v-model="depositOverride"
          type="checkbox"
          class="rounded"
        />
        <label for="deposit-override">Override deposit lock</label>
      </div>
      <p class="text-xs text-amber-700">
        Deposit defaults to pull tabs. Bingo total is computed from the box
        change.
      </p>
    </div>

    <div
      v-if="draft.workflow_type === 'RECUPERATION_BOX_RETURN'"
      class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3"
    >
      <div class="text-xs font-bold uppercase tracking-[0.3em] text-indigo-700">
        Recuperation Details
      </div>
      <label
        class="block text-xs font-bold text-indigo-700 uppercase tracking-wider"
      >
        Beginning Box
        <input
          v-model.number="draft.beginning_box"
          type="number"
          min="0"
          step="0.01"
          class="mt-1 w-full rounded-lg border-indigo-200 bg-white"
          :disabled="beginningBoxLocked"
        />
      </label>
      <label
        class="block text-xs font-bold text-indigo-700 uppercase tracking-wider"
      >
        Ending Box (≤ 4000)
        <input
          v-model.number="draft.ending_box"
          type="number"
          min="0"
          max="4000"
          step="0.01"
          class="mt-1 w-full rounded-lg border-indigo-200 bg-white"
        />
      </label>
      <label
        class="block text-xs font-bold text-indigo-700 uppercase tracking-wider"
      >
        Bingo Actual
        <input
          v-model.number="draft.bingo_actual"
          type="number"
          step="0.01"
          class="mt-1 w-full rounded-lg border-indigo-200 bg-white"
        />
      </label>
      <label
        class="block text-xs font-bold text-indigo-700 uppercase tracking-wider"
      >
        Deposit Actual
        <input
          v-model.number="draft.deposit_actual"
          type="number"
          step="0.01"
          class="mt-1 w-full rounded-lg border-indigo-200 bg-white"
        />
      </label>
      <div class="flex items-center gap-2 text-xs text-indigo-700">
        <input
          id="beginning-override"
          v-model="beginningBoxOverride"
          type="checkbox"
          class="rounded"
        />
        <label for="beginning-override">Override beginning box</label>
      </div>
      <p class="text-xs text-indigo-700">
        Actuals account for recuperation of negative bingo. Deposit is computed
        from pull tabs + bingo actual.
      </p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <div class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
        Computed Totals
      </div>
      <div
        class="flex items-center justify-between text-sm font-semibold text-slate-700"
      >
        <span>Bingo Total</span>
        <span>{{ bingoTotalDisplay }}</span>
      </div>
      <div class="flex items-center justify-between text-sm text-slate-500">
        <span>Formula</span>
        <span>{{ formulaLabel }}</span>
      </div>
    </div>

    <label
      class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
    >
      Notes
      <textarea
        v-model="draft.notes"
        rows="2"
        class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
      ></textarea>
    </label>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="px-4 py-2 text-xs font-bold text-slate-500"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-primary-900 text-white text-xs font-bold uppercase tracking-[0.3em] rounded-lg disabled:opacity-50"
        :disabled="noShifts"
      >
        {{ submitLabel }}
      </button>
    </div>

    <p v-if="noShifts" class="text-xs text-rose-600">
      No shifts available for this date. Use override to create a manual entry.
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatCurrency } from "~/utils/format";

type ShiftFormValue = {
  date: string;
  shift: "AM" | "PM";
  pulltabs_total: number;
  deposit_total?: number;
  players?: number;
  workflow_type: "NORMAL" | "NEGATIVE_BINGO_BOX" | "RECUPERATION_BOX_RETURN";
  beginning_box?: number;
  ending_box?: number;
  bingo_actual?: number;
  deposit_actual?: number;
  notes?: string;
};

const props = defineProps<{
  modelValue: ShiftFormValue;
  availableShifts: Array<"AM" | "PM">;
  prevEndingBox?: number | null;
  shiftHint?: string;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: ShiftFormValue): void;
  (e: "submit", value: ShiftFormValue): void;
  (e: "cancel"): void;
}>();

const shifts = computed(() =>
  props.availableShifts.length ? props.availableShifts : [draft.value.shift],
);
const noShifts = computed(() => props.availableShifts.length === 0);
const draft = ref<ShiftFormValue>({ ...props.modelValue });

const depositOverride = ref(false);
const beginningBoxOverride = ref(false);

const depositLocked = computed(() => {
  if (draft.value.workflow_type === "NEGATIVE_BINGO_BOX") {
    return !depositOverride.value;
  }
  return false;
});

const beginningBoxLocked = computed(() => {
  if (draft.value.workflow_type === "RECUPERATION_BOX_RETURN") {
    return !beginningBoxOverride.value;
  }
  return false;
});

const bingoTotalDisplay = computed(() => {
  if (draft.value.workflow_type === "NEGATIVE_BINGO_BOX") {
    return formatCurrency((draft.value.ending_box ?? 0) - (draft.value.beginning_box ?? 0), 2);
  }
  if (draft.value.workflow_type === "RECUPERATION_BOX_RETURN") {
    if (draft.value.bingo_actual !== undefined) {
      return formatCurrency(draft.value.bingo_actual, 2);
    }
  }
  return formatCurrency((draft.value.deposit_total ?? 0) - (draft.value.pulltabs_total ?? 0), 2);
});

const formulaLabel = computed(() => {
  if (draft.value.workflow_type === "NEGATIVE_BINGO_BOX") {
    return "Ending Box - Beginning Box";
  }
  if (draft.value.workflow_type === "RECUPERATION_BOX_RETURN") {
    return "Pull Tabs + Bingo Actual";
  }
  return "Deposit - Pull Tabs";
});

watch(
  () => props.modelValue,
  (value) => {
    draft.value = { ...value };
  },
  { deep: true },
);

watch(
  () => props.availableShifts,
  (value) => {
    if (value.length && !value.includes(draft.value.shift)) {
      draft.value.shift = value[0];
    }
  },
  { immediate: true },
);

watch(
  () => draft.value.workflow_type,
  (workflow) => {
    if (workflow === "NEGATIVE_BINGO_BOX") {
      draft.value.deposit_total = draft.value.pulltabs_total;
      draft.value.beginning_box = draft.value.beginning_box ?? 4000;
    }
    if (workflow === "RECUPERATION_BOX_RETURN") {
      if (!beginningBoxOverride.value) {
        draft.value.beginning_box =
          props.prevEndingBox ?? draft.value.beginning_box;
      }
      if (draft.value.bingo_actual !== undefined) {
        draft.value.deposit_total =
          draft.value.pulltabs_total + Number(draft.value.bingo_actual);
      }
    }
  },
);

watch(
  () => props.prevEndingBox,
  (value) => {
    if (
      draft.value.workflow_type === "RECUPERATION_BOX_RETURN" &&
      !beginningBoxOverride.value
    ) {
      draft.value.beginning_box = value ?? draft.value.beginning_box;
    }
  },
);

watch(
  () => [draft.value.pulltabs_total, draft.value.bingo_actual],
  () => {
    if (
      draft.value.workflow_type === "NEGATIVE_BINGO_BOX" &&
      !depositOverride.value
    ) {
      draft.value.deposit_total = draft.value.pulltabs_total;
    }
    if (draft.value.workflow_type === "RECUPERATION_BOX_RETURN") {
      if (draft.value.bingo_actual !== undefined) {
        draft.value.deposit_total =
          draft.value.pulltabs_total + Number(draft.value.bingo_actual);
      }
    }
  },
);

watch(
  draft,
  (value) => {
    emit("update:modelValue", { ...value });
  },
  { deep: true },
);

const handleSubmit = () => {
  if (noShifts.value) return;
  emit("submit", { ...draft.value });
};
</script>
