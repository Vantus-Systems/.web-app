<template>
  <div class="space-y-6">
    <!-- Step Indicator -->
    <div class="flex items-center justify-between">
      <div v-for="(step, idx) in steps" :key="idx" class="flex items-center">
        <div
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center font-bold',
            idx < currentStep
              ? 'bg-primary-600 text-white'
              : idx === currentStep
                ? 'bg-primary-900 text-white ring-2 ring-primary-400'
                : 'bg-slate-100 text-slate-400',
          ]"
        >
          {{ idx + 1 }}
        </div>
        <div
          v-if="idx < steps.length - 1"
          :class="[
            'h-1 flex-1 mx-2',
            idx < currentStep ? 'bg-primary-600' : 'bg-slate-200',
          ]"
        />
      </div>
    </div>

    <div class="text-center">
      <h2 class="text-2xl font-black text-primary-900">
        {{ steps[currentStep]?.label }}
      </h2>
      <p class="text-sm text-slate-500 mt-1">
        {{ steps[currentStep]?.description }}
      </p>
    </div>

    <!-- Step 1: Headcount -->
    <div
      v-if="currentStep === 0"
      class="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
    >
      <div class="space-y-2">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Headcount (Players)
        </label>
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
            @click="data.headcount = Math.max(0, data.headcount - 10)"
          >
            -10
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
            @click="data.headcount = Math.max(0, data.headcount - 1)"
          >
            -1
          </button>
          <input
            v-model.number="data.headcount"
            type="number"
            min="0"
            class="flex-1 text-center text-2xl font-bold border-2 border-primary-300 rounded-lg p-3"
          />
          <button
            type="button"
            class="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700"
            @click="data.headcount += 1"
          >
            +1
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700"
            @click="data.headcount += 10"
          >
            +10
          </button>
        </div>
      </div>

      <div
        v-if="data.headcount < 40"
        class="bg-amber-50 border border-amber-200 rounded-lg p-4"
      >
        <p class="text-sm text-amber-700">
          <strong>Attendance is low.</strong> Consider sending staff home?
        </p>
      </div>
    </div>

    <!-- Step 2: Sales -->
    <div
      v-if="currentStep === 1"
      class="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
    >
      <div class="grid grid-cols-2 gap-4">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Bingo Sales ($)
          <input
            v-model.number="data.sales_bingo"
            type="number"
            step="0.01"
            class="mt-1 w-full text-lg font-bold border-2 rounded-lg p-2"
            :class="
              data.sales_bingo < 0
                ? 'border-rose-300 bg-rose-50'
                : 'border-slate-200 bg-white'
            "
          />
        </label>
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
        >
          Pull Tabs Sales ($)
          <input
            v-model.number="data.sales_pulltabs"
            type="number"
            min="0"
            step="0.01"
            class="mt-1 w-full text-lg font-bold border-2 border-slate-200 rounded-lg p-2"
          />
        </label>
      </div>

      <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div
          class="text-xs uppercase tracking-wider text-primary-700 font-bold"
        >
          Total Sales
        </div>
        <div class="text-3xl font-black text-primary-900">
          ${{ formatCurrency(data.sales_bingo + data.sales_pulltabs, 2) }}
        </div>
      </div>

      <div
        v-if="data.sales_bingo < 0"
        class="bg-rose-50 border border-rose-300 rounded-lg p-4 space-y-3"
      >
        <p class="text-sm font-bold text-rose-700">
          ⚠️ Negative Bingo Sales - Reason Required
        </p>
        <label
          class="block text-xs font-bold text-rose-700 uppercase tracking-wider"
        >
          Reason
          <select
            v-model="data.negative_bingo_reason_code"
            class="mt-1 w-full border-rose-300 rounded-lg p-2"
          >
            <option value="">-- Select Reason --</option>
            <option value="HighPayouts">High Payouts</option>
            <option value="JackpotHit">Jackpot Hit</option>
            <option value="PromoNight">Promo Night</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Step 3: Cash Count Wizard -->
    <div v-if="currentStep === 2" class="space-y-6">
      <div class="bg-white border border-slate-200 rounded-xl p-6">
        <p
          class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4"
        >
          Enter Denomination Quantities
        </p>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <label
            v-for="(denom, key) in denominationLabels"
            :key="key"
            class="block"
          >
            <span class="text-xs font-bold text-slate-600">{{
              denom.label
            }}</span>
            <input
              v-model.number="
                data.denominations[key as keyof typeof data.denominations]
              "
              type="number"
              min="0"
              class="mt-1 w-full text-center text-lg font-bold border-2 border-slate-200 rounded-lg p-2"
            />
            <span class="text-[10px] text-slate-400 mt-1 block">
              {{
                denom.value > 1
                  ? `$${denom.value}`
                  : `${formatCurrency(denom.value * 100, 0)}¢`
              }}
            </span>
          </label>
        </div>
      </div>

      <div
        class="bg-primary-50 border border-primary-200 rounded-lg p-4 sticky bottom-0"
      >
        <div
          class="text-xs uppercase tracking-wider text-primary-700 font-bold"
        >
          Total Cash
        </div>
        <div class="text-4xl font-black text-primary-900">
          ${{ formatCurrency(calculateCashTotal(), 2) }}
        </div>
      </div>
    </div>

    <!-- Step 4: Check Verification -->
    <div v-if="currentStep === 3" class="space-y-6">
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <button
          type="button"
          class="w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700"
          @click="addCheckRow"
        >
          + Add Check
        </button>

        <div
          v-if="data.check_logs.length === 0"
          class="py-8 text-center text-slate-400"
        >
          <p>No checks yet. Click "Add Check" to start.</p>
        </div>

        <div
          v-for="(check, idx) in data.check_logs"
          :key="idx"
          class="border border-slate-200 rounded-lg p-4 space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase"
              >Check #{{ idx + 1 }}</span
            >
            <button
              type="button"
              class="text-xs font-bold text-rose-600 hover:underline"
              @click="removeCheckRow(idx)"
            >
              Remove
            </button>
          </div>

          <label class="block">
            <span class="text-xs font-bold text-slate-600">Player Name</span>
            <input
              v-model="check.player_name"
              type="text"
              class="mt-1 w-full border-2 rounded-lg p-2"
              :class="
                restrictedPlayers[idx]
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-200'
              "
              @input="(e) => searchRestrictedOnInput(idx, check.player_name)"
            />
            <div
              v-if="restrictedPlayers[idx]"
              class="mt-2 text-xs text-rose-700 font-bold"
            >
              🛑 RESTRICTED PLAYER - Cannot accept check
            </div>
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="text-xs font-bold text-slate-600">Check #</span>
              <input
                v-model="check.check_number"
                type="text"
                class="mt-1 w-full border-2 border-slate-200 rounded-lg p-2"
              />
            </label>
            <label class="block">
              <span class="text-xs font-bold text-slate-600">Amount ($)</span>
              <input
                v-model.number="check.amount"
                type="number"
                min="0.01"
                step="0.01"
                class="mt-1 w-full border-2 border-slate-200 rounded-lg p-2 text-lg font-bold"
              />
            </label>
          </div>

          <div class="space-y-2 bg-slate-50 p-3 rounded">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="check.stamped_on_back"
                type="checkbox"
                class="rounded"
              />
              <span class="text-xs font-bold text-slate-700"
                >Stamped on Back ✓</span
              >
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="check.phone_dl_written"
                type="checkbox"
                class="rounded"
              />
              <span class="text-xs font-bold text-slate-700"
                >Phone/DL Written ✓</span
              >
            </label>
          </div>
        </div>
      </div>

      <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div
          class="text-xs uppercase tracking-wider text-primary-700 font-bold"
        >
          Total Checks
        </div>
        <div class="text-3xl font-black text-primary-900">
          ${{
            formatCurrency(
              data.check_logs.reduce((sum, c) => sum + c.amount, 0),
              2,
            )
          }}
        </div>
      </div>
    </div>

    <!-- Step 5: Reconciliation -->
    <div v-if="currentStep === 4" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          class="bg-white border border-slate-200 rounded-xl p-6 text-center"
        >
          <div
            class="text-xs uppercase tracking-wider text-slate-500 font-bold"
          >
            Expected Sales
          </div>
          <div class="text-3xl font-black text-primary-900 mt-2">
            ${{ formatCurrency(data.sales_bingo + data.sales_pulltabs, 2) }}
          </div>
        </div>
        <div
          class="bg-white border border-slate-200 rounded-xl p-6 text-center"
        >
          <div
            class="text-xs uppercase tracking-wider text-slate-500 font-bold"
          >
            Actual Deposited
          </div>
          <div class="text-3xl font-black text-primary-900 mt-2">
            ${{
              formatCurrency(
                calculateCashTotal() +
                  data.check_logs.reduce((sum, c) => sum + c.amount, 0),
                2,
              )
            }}
          </div>
        </div>
        <div
          :class="[
            'rounded-xl p-6 text-center',
            reconciliationResult.isBalanced
              ? 'bg-emerald-50 border border-emerald-300'
              : 'bg-rose-50 border border-rose-300',
          ]"
        >
          <div
            class="text-xs uppercase tracking-wider font-bold"
            :class="
              reconciliationResult.isBalanced
                ? 'text-emerald-700'
                : 'text-rose-700'
            "
          >
            {{
              reconciliationResult.isBalanced
                ? "✓ Perfect Match"
                : "⚠️ Variance"
            }}
          </div>
          <div
            :class="[
              'text-3xl font-black mt-2',
              reconciliationResult.isBalanced
                ? 'text-emerald-900'
                : 'text-rose-900',
            ]"
          >
            ${{ formatCurrency(Math.abs(reconciliationResult.variance), 2) }}
          </div>
        </div>
      </div>

      <div
        v-if="!reconciliationResult.isBalanced"
        class="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4"
      >
        <p class="text-sm font-bold text-amber-700">
          ⚠️ Variance of ${{
            formatCurrency(Math.abs(reconciliationResult.variance), 2)
          }}
          detected
        </p>
        <label
          class="block text-xs font-bold text-amber-700 uppercase tracking-wider"
        >
          Variance Note (Required)
          <textarea
            v-model="data.variance_note"
            rows="3"
            class="mt-1 w-full border-amber-300 rounded-lg p-2"
            placeholder="Explain the discrepancy..."
          ></textarea>
        </label>
      </div>

      <div
        class="bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-3"
      >
        <p class="text-xs font-bold text-indigo-700 uppercase tracking-wider">
          Report an Issue?
        </p>
        <button
          type="button"
          class="w-full px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
          @click="showIncidentModal = true"
        >
          Report Incident
        </button>
      </div>
    </div>

    <div
      class="flex items-center justify-between gap-4 pt-6 border-t border-slate-200"
    >
      <button
        type="button"
        class="px-6 py-2 text-slate-600 font-bold hover:text-slate-900"
        :disabled="currentStep === 0"
        @click="goBack"
      >
        ← Back
      </button>

      <button
        v-if="currentStep < 4"
        type="button"
        class="px-6 py-3 bg-primary-900 text-white font-bold rounded-lg hover:bg-primary-800 disabled:opacity-50"
        :disabled="!canProceedToNext"
        @click="nextStep"
      >
        Next →
      </button>

      <button
        v-else
        type="button"
        class="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        :disabled="!canSubmit"
        @click="submit"
      >
        Submit Shift
      </button>
    </div>

    <div
      v-if="showIncidentModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
        <h3 class="text-lg font-bold text-primary-900">Report Incident</h3>
        <label class="block text-xs font-bold text-slate-600 uppercase">
          Incident Type
          <select
            v-model="incidentData.type"
            class="mt-1 w-full border-slate-200 rounded-lg p-2"
          >
            <option value="">-- Select Type --</option>
            <option value="Maintenance">Maintenance</option>
            <option value="PlayerIssue">Player Issue</option>
            <option value="Supply">Supply</option>
            <option value="Money">Money</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label class="block text-xs font-bold text-slate-600 uppercase">
          Description
          <textarea
            v-model="incidentData.description"
            rows="3"
            class="mt-1 w-full border-slate-200 rounded-lg p-2"
            placeholder="Describe the issue..."
          ></textarea>
        </label>

        <div class="flex gap-2 justify-end">
          <button
            type="button"
            class="px-4 py-2 text-slate-600 font-bold hover:text-slate-900"
            @click="showIncidentModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700"
            @click="submitIncident"
          >
            Report
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { formatCurrency } from "~/utils/format";
import { reconcile } from "~/server/utils/mic-money";
import { useCsrf } from "~/composables/useCsrf";
import type {
  DenominationCount,
  MicShiftSubmission,
} from "~/server/schemas/micShift.zod";

const { getHeaders } = useCsrf();

const props = defineProps<{
  initialDate?: string;
}>();

const emit = defineEmits<{
  (e: "submit", shift: MicShiftSubmission): void;
}>();

const steps = [
  { label: "Headcount", description: "How many players today?" },
  { label: "Sales", description: "Enter bingo and pull tab sales" },
  { label: "Cash Count", description: "Enter denomination quantities" },
  { label: "Checks", description: "Add and verify checks" },
  { label: "Reconcile", description: "Verify totals match" },
];

const currentStep = ref(0);
const showIncidentModal = ref(false);

const denominationLabels = {
  denom_100_count: { label: "$100", value: 100 },
  denom_50_count: { label: "$50", value: 50 },
  denom_20_count: { label: "$20", value: 20 },
  denom_10_count: { label: "$10", value: 10 },
  denom_5_count: { label: "$5", value: 5 },
  denom_1_count: { label: "$1", value: 1 },
  denom_quarters: { label: "Quarters", value: 0.25 },
  denom_dimes: { label: "Dimes", value: 0.1 },
  denom_nickels: { label: "Nickels", value: 0.05 },
  denom_pennies: { label: "Pennies", value: 0.01 },
} as const;

const data = ref<MicShiftSubmission>({
  date: props.initialDate || new Date().toISOString().slice(0, 10),
  shift: "AM",
  headcount: 0,
  sales_bingo: 0,
  sales_pulltabs: 0,
  denominations: {
    denom_100_count: 0,
    denom_50_count: 0,
    denom_20_count: 0,
    denom_10_count: 0,
    denom_5_count: 0,
    denom_1_count: 0,
    denom_quarters: 0,
    denom_dimes: 0,
    denom_nickels: 0,
    denom_pennies: 0,
  },
  check_logs: [],
  variance_note: undefined,
  notes: undefined,
  negative_bingo_reason_code: undefined,
});

const incidentData = ref({ type: "", description: "" });
const restrictedPlayers = ref<Record<number, boolean>>({});

const calculateCashTotal = (): number => {
  const denominationValues: Record<keyof DenominationCount, number> = {
    denom_100_count: 100,
    denom_50_count: 50,
    denom_20_count: 20,
    denom_10_count: 10,
    denom_5_count: 5,
    denom_1_count: 1,
    denom_quarters: 0.25,
    denom_dimes: 0.1,
    denom_nickels: 0.05,
    denom_pennies: 0.01,
  };

  let total = 0;
  for (const [key, value] of Object.entries(denominationValues)) {
    const count = data.value.denominations[key as keyof DenominationCount];
    total += count * value;
  }
  return Math.round(total * 100) / 100;
};

const reconciliationResult = computed(() => {
  const cashTotal = calculateCashTotal();
  const checksTotal = data.value.check_logs.reduce(
    (sum, c) => sum + c.amount,
    0,
  );
  const salesTotal = data.value.sales_bingo + data.value.sales_pulltabs;
  return reconcile(cashTotal, checksTotal, salesTotal, 1.0);
});

const canProceedToNext = computed(() => {
  if (currentStep.value === 0) return data.value.headcount >= 0;
  if (currentStep.value === 1) {
    if (data.value.sales_bingo < 0) {
      return Boolean(data.value.negative_bingo_reason_code);
    }
    return data.value.sales_pulltabs >= 0;
  }
  if (currentStep.value === 2) return true;
  if (currentStep.value === 3) {
    return data.value.check_logs.every(
      (check) => check.stamped_on_back && check.phone_dl_written,
    );
  }
  return false;
});

const canSubmit = computed(() => {
  if (currentStep.value !== 4) return false;
  const hasInvalidCheck = data.value.check_logs.some(
    (check) => !check.stamped_on_back || !check.phone_dl_written,
  );
  const needsVarianceNote =
    !reconciliationResult.value.isBalanced && !data.value.variance_note;
  return !hasInvalidCheck && !needsVarianceNote;
});

const searchRestrictedOnInput = async (idx: number, playerName: string) => {
  if (!playerName) {
    restrictedPlayers.value[idx] = false;
    return;
  }
  try {
    const results = await $fetch<unknown[]>(
      `/api/admin/mic/restricted-players/search?query=${encodeURIComponent(playerName)}`,
      {
        credentials: "include",
      },
    );

    if (!Array.isArray(results)) {
      restrictedPlayers.value[idx] = false;
      return;
    }

    restrictedPlayers.value[idx] = results.length > 0;
  } catch (error) {
    console.error("Restricted search failed", error);
  }
};

const addCheckRow = () => {
  data.value.check_logs.push({
    player_name: "",
    check_number: "",
    amount: 0,
    stamped_on_back: false,
    phone_dl_written: false,
  });
};

const removeCheckRow = (idx: number) => {
  data.value.check_logs.splice(idx, 1);
  delete restrictedPlayers.value[idx];
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value += 1;
  }
};

const goBack = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
  }
};

const submitIncident = async () => {
  if (!incidentData.value.type || !incidentData.value.description) return;

  try {
    await $fetch("/api/admin/mic/incidents", {
      method: "POST",
      body: incidentData.value,
      headers: getHeaders(),
      credentials: "include",
    });
    incidentData.value = { type: "", description: "" };
    showIncidentModal.value = false;
  } catch (error) {
    console.error("Incident submission failed", error);
  }
};

const submit = () => {
  emit("submit", JSON.parse(JSON.stringify(data.value)));
};
</script>
