<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Row 1: Meta -->
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
        <div class="flex items-center">
          <span class="mr-1">Type</span>
          <HelpTip
            text="Normal: Standard shift. Negative: Box lost money. Recuperation: Box being refilled."
          />
        </div>
        <select
          v-model="draft.workflow_type"
          class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
        >
          <option value="NORMAL">Normal Shift</option>
          <option value="NEGATIVE_BINGO_BOX">Negative Bingo / Short Box</option>
          <option value="RECUPERATION_BOX_RETURN">
            Recuperation / Refill Box
          </option>
        </select>
        <span
          v-if="detectedWorkflow !== draft.workflow_type"
          class="text-[10px] text-primary-600 block mt-1"
        >
          Suggested: {{ detectedWorkflow }}
        </span>
      </label>
    </div>

    <!-- Row 2: Boxes -->
    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
      <div class="grid grid-cols-2 gap-4">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          <div class="flex items-center">
            <span class="mr-1">Starting Box ($)</span>
            <HelpTip text="Amount in the drawer at the START of the shift." />
          </div>
          <input
            v-model.number="draft.beginning_box"
            type="number"
            step="0.01"
            class="mt-1 w-full rounded-lg border-slate-200 bg-white"
            @input="handleBoxInput"
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          <div class="flex items-center">
            <span class="mr-1">Ending Box ($)</span>
            <HelpTip text="Amount in the drawer at the END of the shift." />
          </div>
          <input
            v-model.number="draft.ending_box"
            type="number"
            step="0.01"
            max="4000"
            class="mt-1 w-full rounded-lg border-slate-200 bg-white"
            @input="handleBoxInput"
          />
        </label>
      </div>
      <div
        v-if="derived.box_delta !== null"
        class="flex justify-between items-center text-xs pt-2 border-t border-slate-200"
      >
        <div class="flex items-center text-slate-500">
          <span class="font-bold mr-1">Box Change:</span>
          <HelpTip
            text="Ending Box - Starting Box. Positive means cash was added."
          />
        </div>
        <span
          :class="derived.box_delta >= 0 ? 'text-emerald-600' : 'text-red-600'"
          class="font-mono font-bold"
        >
          {{ derived.box_delta > 0 ? "+" : ""
          }}{{ formatCurrency(derived.box_delta) }}
        </span>
      </div>
      <div
        v-else
        class="text-xs text-amber-600 font-bold flex items-center gap-2 pt-1"
      >
        <span>⚠️ Missing box counts</span>
      </div>
    </div>

    <!-- Row 3: Totals & Deposit -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left: Components -->
      <div class="space-y-4">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          <div class="flex items-center">
            <span class="mr-1">Pulltabs Net</span>
            <HelpTip text="Net income from pulltab sales." />
          </div>
          <input
            v-model.number="draft.pulltabs_total"
            type="number"
            step="0.01"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50 font-mono font-bold"
            @input="calculate('pulltabs')"
          />
        </label>

        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          <div class="flex items-center">
            <span class="mr-1">Bingo (Deposited)</span>
            <HelpTip
              text="The portion of the bank deposit that came from Bingo sales. (Deposit - Pulltabs)"
            />
          </div>
          <input
            v-model.number="draft.bingo_total_input"
            type="number"
            step="0.01"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50 font-mono font-bold text-primary-700"
            :disabled="isBingoLocked"
            @input="calculate('bingo')"
          />
          <span
            v-if="isBingoLocked"
            class="text-[10px] text-slate-400 block mt-1"
          >
            Locked to Box Delta (Negative Workflow)
          </span>
        </label>
      </div>

      <!-- Right: Bank & Players -->
      <div class="space-y-4">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          <div class="flex items-center">
            <span class="mr-1">Deposit to Bank</span>
            <HelpTip
              text="The actual amount of cash taken to the bank. Does not include box money."
            />
          </div>
          <input
            v-model.number="draft.deposit_total"
            type="number"
            step="0.01"
            class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50 font-mono font-bold"
            @input="calculate('deposit')"
          />
        </label>

        <div v-if="draft.shift === 'PM'">
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
          >
            <div class="flex items-center">
              <span class="mr-1">Player Count</span>
              <HelpTip text="Number of players during the session." />
            </div>
            <input
              v-model.number="draft.players"
              type="number"
              min="0"
              step="1"
              class="mt-1 w-full rounded-lg border-slate-200 bg-slate-50"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Actuals Panel -->
    <div
      class="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-3 shadow-inner"
    >
      <div
        class="flex justify-between items-center pb-2 border-b border-slate-700"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-slate-300">Actual Revenue</span>
          <HelpTip
            text="Deposit to Bank + Box Change. This is the true profit/loss for the shift."
          />
        </div>
        <span
          :class="
            (derived.actual_revenue || 0) >= 0 ? 'text-white' : 'text-red-400'
          "
          class="font-mono text-xl font-black"
        >
          {{
            derived.actual_revenue !== null
              ? formatCurrency(derived.actual_revenue)
              : "---"
          }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-4 text-xs">
        <div>
          <div class="flex items-center text-slate-400 mb-1">
            <span class="mr-1">Bingo (Actual)</span>
            <HelpTip text="Bingo Deposited + Box Change." />
          </div>
          <span class="font-mono font-bold text-slate-200">
            {{
              derived.bingo_actual !== null
                ? formatCurrency(derived.bingo_actual)
                : "---"
            }}
          </span>
        </div>
        <!-- Add more if needed, but Actual Revenue is key -->
      </div>
      <div v-if="derived.warnings.length" class="text-xs text-amber-400 mt-2">
        <div v-for="w in derived.warnings" :key="w">⚠️ {{ w }}</div>
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
        class="px-4 py-2 bg-primary-900 text-white text-xs font-bold uppercase tracking-[0.3em] rounded-lg disabled:opacity-50 hover:bg-primary-800 transition-colors shadow-sm"
        :disabled="noShifts"
      >
        {{ submitLabel }}
      </button>
    </div>

    <p v-if="noShifts" class="text-xs text-rose-600">
      No shifts available for this date. Check archive or use override.
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { formatCurrency } from "~/utils/format";
import {
  useShiftCalculations,
  type ShiftState,
} from "~/composables/useShiftCalculations";
import { calculateShiftDerived } from "~/utils/shiftDerivedTotals";
import HelpTip from "~/components/ui/HelpTip.vue";

type ShiftFormValue = {
  date: string;
  shift: "AM" | "PM";
  pulltabs_total: number;
  deposit_total?: number;
  players?: number;
  workflow_type?: string;
  beginning_box?: number;
  ending_box?: number;
  bingo_actual?: number;
  deposit_actual?: number;
  bingo_total?: number; // From DB record
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

// Initialize draft with bingo_total_input mapped
const initialDraft = { ...props.modelValue };
// If bingo_total exists (editing), use it. Else default to 0.
const bingoTotalInput = initialDraft.bingo_total ?? 0;

// Internal state extending ShiftState for the composable
const draft = ref<ShiftState & { players?: number; notes?: string }>({
  // Required by ShiftState
  workflow_type: initialDraft.workflow_type || "NORMAL",
  beginning_box: initialDraft.beginning_box ?? 4000,
  ending_box: initialDraft.ending_box ?? 4000,
  pulltabs_total: initialDraft.pulltabs_total ?? 0,
  deposit_total: initialDraft.deposit_total ?? 0,
  bingo_total_input: bingoTotalInput,

  // Extra fields
  date: initialDraft.date,
  shift: initialDraft.shift,
  players: initialDraft.players,
  notes: initialDraft.notes,
});

const pinnedField = ref<"bingo" | "deposit">("deposit");

const { detectedWorkflow, bingoActual, depositActual, calculate } =
  useShiftCalculations(draft, pinnedField);

const derived = computed(() =>
  calculateShiftDerived({
    beginning_box: draft.value.beginning_box,
    ending_box: draft.value.ending_box,
    pulltabs_total: draft.value.pulltabs_total,
    deposit_bank_total: draft.value.deposit_total,
  }),
);

const isBingoLocked = computed(
  () => draft.value.workflow_type === "NEGATIVE_BINGO_BOX",
);

const handleBoxInput = () => {
  // If user hasn't explicitly set a weird workflow, follow detection
  if (detectedWorkflow.value !== draft.value.workflow_type) {
    draft.value.workflow_type = detectedWorkflow.value;
  }
  // Recalculate if in negative mode (box delta drives bingo total)
  if (draft.value.workflow_type === "NEGATIVE_BINGO_BOX") {
    calculate("box");
  }
};

// Sync computed actuals back to draft for submission
// We don't need to show them as inputs, but we want them in the payload
watch([bingoActual, depositActual], () => {
  // We don't store them in 'draft' explicitly as inputs, but we will emit them on submit
});

const handleSubmit = () => {
  const payload: ShiftFormValue & { deposit_bank_total?: number } = {
    date: draft.value.date!,
    shift: draft.value.shift!,
    pulltabs_total: draft.value.pulltabs_total,
    deposit_total: draft.value.deposit_total,
    deposit_bank_total: draft.value.deposit_total,
    players: draft.value.shift === "PM" ? draft.value.players : 0,
    workflow_type: draft.value.workflow_type,
    beginning_box: draft.value.beginning_box,
    ending_box: draft.value.ending_box,
    bingo_actual: derived.value.bingo_actual ?? bingoActual.value, // Prefer derived
    deposit_actual: derived.value.actual_revenue ?? depositActual.value,
    notes: draft.value.notes,
    bingo_total: draft.value.bingo_total_input,
  };
  emit("submit", payload);
};

// If box props update (like prev Ending Box), update draft
watch(
  () => props.prevEndingBox,
  (val) => {
    if (val !== undefined && val !== null) {
      // Only set if we are creating new? Or logic?
      // Usually parent handles defaults.
    }
  },
);
</script>
