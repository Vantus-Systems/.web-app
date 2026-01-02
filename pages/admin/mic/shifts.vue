<template>
  <AdminShell
    title="Shift Management"
    subtitle="Record & Submit Shift Data"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Progress Stepper -->
      <div class="mb-8">
        <div class="flex items-center justify-between relative">
          <div
            class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"
          ></div>
          <div
            v-for="step in steps"
            :key="step.number"
            class="flex flex-col items-center gap-2 bg-white px-2"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors"
              :class="
                currentStep >= step.number
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              "
            >
              {{ step.number }}
            </div>
            <span
              class="text-[10px] font-bold uppercase tracking-wider"
              :class="
                currentStep >= step.number
                  ? 'text-primary-700'
                  : 'text-slate-400'
              "
            >
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div
        class="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8"
      >
        <form @submit.prevent="handleSubmit">
          <!-- Step 1: Setup -->
          <div v-if="currentStep === 1" class="space-y-6">
            <h3 class="text-xl font-black text-slate-900">Shift Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                >
                  Date
                </label>
                <input
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                >
                  Shift
                </label>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="form.shift"
                      type="radio"
                      value="AM"
                      class="text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-sm font-medium text-slate-700"
                      >Day (AM)</span
                    >
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="form.shift"
                      type="radio"
                      value="PM"
                      class="text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-sm font-medium text-slate-700"
                      >Evening (PM)</span
                    >
                  </label>
                </div>
              </div>
              <div>
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                >
                  Headcount
                </label>
                <input
                  v-model.number="form.headcount"
                  type="number"
                  min="0"
                  required
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Step 2: Sales -->
          <div v-if="currentStep === 2" class="space-y-6">
            <h3 class="text-xl font-black text-slate-900">Sales Entry</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Bingo Sales
                </label>
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono"
                    >$</span
                  >
                  <input
                    v-model.number="form.sales_bingo"
                    type="number"
                    step="0.01"
                    required
                    class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-slate-50 text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                    :class="
                      form.sales_bingo < 0 ? 'text-red-600' : 'text-slate-900'
                    "
                  />
                </div>

                <div
                  v-if="form.sales_bingo < 0"
                  class="bg-red-50 border border-red-100 rounded-lg p-4 animate-fade-in"
                >
                  <label
                    class="block text-xs font-bold text-red-700 uppercase tracking-wider mb-2"
                  >
                    Reason for Negative Sales
                  </label>
                  <select
                    v-model="form.negative_bingo_reason_code"
                    required
                    class="w-full rounded-lg border-red-200 bg-white px-3 py-2 text-sm text-red-900 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="" disabled>Select Reason...</option>
                    <option value="HighPayouts">High Payouts</option>
                    <option value="JackpotHit">Jackpot Hit</option>
                    <option value="PromoNight">Promo Night</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div class="space-y-4">
                <label
                  class="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Pulltab Sales
                </label>
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono"
                    >$</span
                  >
                  <input
                    v-model.number="form.sales_pulltabs"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-slate-50 text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div
              class="bg-slate-50 rounded-xl p-6 flex justify-between items-center border border-slate-200"
            >
              <span
                class="text-sm font-bold text-slate-500 uppercase tracking-wider"
                >Total Sales</span
              >
              <span class="text-2xl font-black text-slate-900 font-mono">{{
                formatCurrency(totalSales)
              }}</span>
            </div>
          </div>

          <!-- Step 3: Cash -->
          <div v-if="currentStep === 3" class="space-y-6">
            <h3 class="text-xl font-black text-slate-900">Cash Count</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="(label, key) in denominationsMap"
                :key="key"
                class="bg-slate-50 p-4 rounded-xl border border-slate-100"
              >
                <label
                  class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center"
                >
                  {{ label }}
                </label>
                <input
                  v-model.number="form.denominations[key]"
                  type="number"
                  min="0"
                  class="w-full text-center bg-white border border-slate-200 rounded-lg py-2 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                  @focus="$event.target.select()"
                />
                <div class="text-center mt-2 text-xs font-mono text-slate-500">
                  {{
                    formatCurrency(form.denominations[key] * getDenomValue(key))
                  }}
                </div>
              </div>
            </div>

            <div
              class="bg-primary-50 rounded-xl p-6 flex justify-between items-center border border-primary-100"
            >
              <span
                class="text-sm font-bold text-primary-700 uppercase tracking-wider"
                >Total Cash</span
              >
              <span class="text-3xl font-black text-primary-900 font-mono">{{
                formatCurrency(totalCash)
              }}</span>
            </div>
          </div>

          <!-- Step 4: Checks -->
          <div v-if="currentStep === 4" class="space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-black text-slate-900">Checks</h3>
              <button
                type="button"
                class="text-xs font-bold text-primary-700 uppercase tracking-wider hover:text-primary-900 flex items-center gap-1"
                @click="addCheck"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
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
                Add Check
              </button>
            </div>

            <div class="space-y-4">
              <div
                v-for="(check, index) in form.check_logs"
                :key="index"
                class="bg-slate-50 rounded-xl p-4 border border-slate-200 relative group"
              >
                <button
                  type="button"
                  class="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  @click="removeCheck(index)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                      >Player Name</label
                    >
                    <input
                      v-model="check.player_name"
                      type="text"
                      required
                      placeholder="Full Name"
                      class="w-full rounded-lg border-slate-200 text-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                      >Check #</label
                    >
                    <input
                      v-model="check.check_number"
                      type="text"
                      required
                      placeholder="1234"
                      class="w-full rounded-lg border-slate-200 text-sm px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                      >Amount</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                        >$</span
                      >
                      <input
                        v-model.number="check.amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        class="w-full rounded-lg border-slate-200 text-sm pl-6 pr-3 py-2 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex gap-6 border-t border-slate-200 pt-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="check.stamped_on_back"
                      type="checkbox"
                      class="rounded text-green-600 focus:ring-green-500"
                    />
                    <span
                      class="text-xs font-bold text-slate-600 uppercase tracking-wider"
                      >Stamped on Back</span
                    >
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="check.phone_dl_written"
                      type="checkbox"
                      class="rounded text-green-600 focus:ring-green-500"
                    />
                    <span
                      class="text-xs font-bold text-slate-600 uppercase tracking-wider"
                      >Phone/DL Written</span
                    >
                  </label>
                </div>
              </div>

              <div
                v-if="form.check_logs.length === 0"
                class="text-center py-8 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200"
              >
                No checks recorded.
              </div>
            </div>

            <div
              class="bg-slate-50 rounded-xl p-6 flex justify-between items-center border border-slate-200"
            >
              <span
                class="text-sm font-bold text-slate-500 uppercase tracking-wider"
                >Total Checks</span
              >
              <span class="text-2xl font-black text-slate-900 font-mono">{{
                formatCurrency(totalChecks)
              }}</span>
            </div>
          </div>

          <!-- Step 5: Review -->
          <div v-if="currentStep === 5" class="space-y-8">
            <h3 class="text-xl font-black text-slate-900">Review & Submit</h3>

            <!-- Summary Card -->
            <div class="bg-slate-900 text-white rounded-xl p-6 shadow-xl">
              <div class="grid grid-cols-2 gap-8">
                <div>
                  <p
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >
                    Total Sales
                  </p>
                  <p class="text-3xl font-mono font-bold">
                    {{ formatCurrency(totalSales) }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >
                    Total Deposit
                  </p>
                  <p class="text-3xl font-mono font-bold text-green-400">
                    {{ formatCurrency(totalDeposit) }}
                  </p>
                </div>
              </div>

              <div class="mt-8 pt-6 border-t border-slate-700">
                <div class="flex justify-between items-end">
                  <div>
                    <p
                      class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                    >
                      Variance
                    </p>
                    <p class="text-sm text-slate-400">
                      Difference between Sales and Deposit
                    </p>
                  </div>
                  <p
                    class="text-4xl font-mono font-black"
                    :class="
                      variance === 0
                        ? 'text-white'
                        : variance > 0
                          ? 'text-green-400'
                          : 'text-red-400'
                    "
                  >
                    {{ formatCurrency(variance) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Validation Errors -->
            <div
              v-if="validationErrors.length > 0"
              class="bg-red-50 border border-red-100 rounded-xl p-4"
            >
              <h4
                class="text-sm font-bold text-red-800 uppercase tracking-wider mb-2"
              >
                Please fix the following:
              </h4>
              <ul class="list-disc list-inside text-sm text-red-700 space-y-1">
                <li v-for="error in validationErrors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>

            <!-- Notes -->
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Shift Notes
                <span v-if="variance !== 0" class="text-red-500"
                  >* (Required for variance)</span
                >
              </label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Any issues, incidents, or explanations for variance..."
                :required="variance !== 0"
              ></textarea>
            </div>
          </div>

          <!-- Navigation -->
          <div class="mt-8 pt-6 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              class="px-6 py-2 text-slate-600 font-bold uppercase tracking-wider text-sm hover:text-slate-900 transition-colors"
              :class="{ invisible: currentStep === 1 }"
              @click="prevStep"
            >
              Back
            </button>

            <button
              v-if="currentStep < 5"
              type="button"
              class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-xl transition-all"
              @click="nextStep"
            >
              Next
            </button>

            <button
              v-else
              type="submit"
              :disabled="isSubmitting || validationErrors.length > 0"
              class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? "Submitting..." : "Submit Shift" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import { useCsrf } from "~/composables/useCsrf";
import { formatCurrency } from "~/utils/format";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const { getHeaders, refreshCsrfToken } = useCsrf();
const session = ref<{ username?: string; role?: any } | null>(null);

// --- Constants ---
const steps = [
  { number: 1, label: "Setup" },
  { number: 2, label: "Sales" },
  { number: 3, label: "Cash" },
  { number: 4, label: "Checks" },
  { number: 5, label: "Review" },
];

const denominationsMap: Record<string, string> = {
  denom_100_count: "$100",
  denom_50_count: "$50",
  denom_20_count: "$20",
  denom_10_count: "$10",
  denom_5_count: "$5",
  denom_1_count: "$1",
  denom_quarters: "Quarters",
  denom_dimes: "Dimes",
  denom_nickels: "Nickels",
  denom_pennies: "Pennies",
};

const denomValues: Record<string, number> = {
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

// --- State ---
const currentStep = ref(1);
const isSubmitting = ref(false);

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  shift: "AM" as "AM" | "PM",
  headcount: 0,
  sales_bingo: 0,
  sales_pulltabs: 0,
  negative_bingo_reason_code: "",
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
  } as Record<string, number>,
  check_logs: [] as any[],
  notes: "",
});

// --- Computed ---
const totalSales = computed(
  () => form.value.sales_bingo + form.value.sales_pulltabs,
);

const totalCash = computed(() => {
  let sum = 0;
  for (const [key, count] of Object.entries(form.value.denominations)) {
    sum += count * (denomValues[key] || 0);
  }
  return sum;
});

const totalChecks = computed(() => {
  return form.value.check_logs.reduce(
    (sum, check) => sum + (Number(check.amount) || 0),
    0,
  );
});

const totalDeposit = computed(() => totalCash.value + totalChecks.value);

const variance = computed(() => totalDeposit.value - totalSales.value);

const validationErrors = computed(() => {
  const errors = [];
  if (variance.value !== 0 && !form.value.notes) {
    errors.push(
      "Variance detected. You must provide a note explaining the difference.",
    );
  }
  const invalidChecks = form.value.check_logs.some(
    (c) => !c.stamped_on_back || !c.phone_dl_written,
  );
  if (invalidChecks) {
    errors.push("All checks must be stamped and have contact info written.");
  }
  return errors;
});

// --- Methods ---
const getDenomValue = (key: string) => denomValues[key] || 0;

const addCheck = () => {
  form.value.check_logs.push({
    player_name: "",
    check_number: "",
    amount: 0,
    stamped_on_back: false,
    phone_dl_written: false,
  });
};

const removeCheck = (index: number) => {
  form.value.check_logs.splice(index, 1);
};

const nextStep = () => {
  if (currentStep.value < 5) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const handleSubmit = async () => {
  if (validationErrors.value.length > 0) return;

  isSubmitting.value = true;
  try {
    const payload = {
      ...form.value,
      variance_note: variance.value !== 0 ? form.value.notes : undefined,
    };

    await $fetch("/api/admin/mic/shifts", {
      method: "POST",
      body: payload,
      headers: getHeaders(),
      credentials: "include",
    });

    alert("Shift submitted successfully!");
    router.push("/admin/mic");
  } catch (e: any) {
    alert(e?.message || "Failed to submit shift.");
  } finally {
    isSubmitting.value = false;
  }
};

const logout = async () => {
  await refreshCsrfToken();
  await $fetch("/api/auth/logout", {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  router.push("/admin/login");
};

onMounted(async () => {
  const sessionData = await $fetch("/api/auth/user", {
    credentials: "include",
  });
  session.value = sessionData.user;
});
</script>

<style scoped>
/* Simple fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
