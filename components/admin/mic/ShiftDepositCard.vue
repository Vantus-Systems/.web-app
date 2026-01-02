<template>
  <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
    <!-- Header with Toggle -->
    <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Shift Deposit</h3>
        <p class="text-sm text-slate-500">Enter shift totals and deposit details</p>
      </div>
      
      <!-- View Toggle -->
      <div class="flex items-center bg-slate-100 rounded-lg p-1 self-start md:self-auto">
        <button
          type="button"
          class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all"
          :class="viewMode === 'form' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="viewMode = 'form'"
        >
          Form View
        </button>
        <button
          type="button"
          class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all"
          :class="viewMode === 'workflow' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="viewMode = 'workflow'"
        >
          Workflow View
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Workflow View -->
      <div v-if="viewMode === 'workflow'">
        <ShiftWizard 
          :initial-date="date" 
          @submit="handleWorkflowSubmit" 
        />
      </div>

      <!-- Form View -->
      <div v-else class="space-y-8">
        <form @submit.prevent="handleFormSubmit" class="space-y-8">
          
          <!-- Section 1: Headcount & Sales -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Headcount -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Headcount
              </label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200"
                  @click="formData.headcount = Math.max(0, formData.headcount - 1)"
                >
                  -
                </button>
                <input
                  v-model.number="formData.headcount"
                  type="number"
                  min="0"
                  class="flex-1 text-center font-bold border-slate-200 rounded-lg"
                />
                <button
                  type="button"
                  class="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200"
                  @click="formData.headcount++"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Bingo Sales -->
            <label class="block space-y-2">
              <span class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Bingo Sales (Calculated)
              </span>
              <div 
                class="w-full font-bold border rounded-lg px-3 py-2 bg-slate-100 flex items-center justify-between"
                :class="calculatedBingo < 0 ? 'bg-rose-50 border-rose-300 text-rose-900' : 'border-slate-200 text-slate-700'"
              >
                <span>${{ formatCurrency(calculatedBingo) }}</span>
                <span class="text-[10px] font-normal text-slate-500">(Deposit - Pull Tabs)</span>
              </div>
            </label>

            <!-- Pull Tabs Sales -->
            <label class="block space-y-2">
              <span class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pull Tabs Sales ($)
              </span>
              <input
                v-model.number="formData.sales_pulltabs"
                type="number"
                min="0"
                step="0.01"
                class="w-full font-bold border-slate-200 rounded-lg"
              />
            </label>
          </div>

          <!-- Negative Bingo Reason -->
          <div v-if="calculatedBingo < 0" class="animate-in fade-in slide-in-from-top-2">
            <label class="block space-y-2">
              <span class="block text-xs font-bold text-rose-600 uppercase tracking-wider">
                Reason for Negative Bingo
              </span>
              <textarea
                v-model="formData.negative_bingo_reason"
                rows="2"
                class="w-full text-sm border-rose-200 bg-rose-50 rounded-lg focus:ring-rose-500 focus:border-rose-500 placeholder-rose-300"
                placeholder="Please explain why bingo sales are negative..."
                required
              ></textarea>
            </label>
          </div>

          <!-- Section 2: Deposit Breakdown -->
          <div class="bg-slate-50 rounded-xl p-6 space-y-6 border border-slate-200">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Deposit Breakdown
              </h4>
              
              <!-- Currency Tracker Toggle -->
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="enableCurrencyTracker"
                  type="checkbox"
                  class="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="text-xs font-bold text-slate-600">
                  Enable Currency Tracker
                </span>
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <!-- Currency Input (Simple vs Tracker) -->
              <div class="space-y-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Currency ($)
                </label>
                
                <div v-if="!enableCurrencyTracker">
                  <input
                    v-model.number="formData.cash_currency"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full font-bold border-slate-200 rounded-lg bg-white"
                    placeholder="0.00"
                  />
                </div>
                
                <div v-else class="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                  <div class="flex justify-between items-center bg-slate-50 p-2 rounded mb-2">
                    <span class="text-xs font-bold text-slate-500">Total</span>
                    <span class="font-bold text-slate-900">${{ formatCurrency(currencyTrackerTotal) }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div v-for="denom in denominations" :key="denom.value" class="flex items-center gap-2">
                      <span class="text-[10px] font-bold text-slate-400 w-8">${{ denom.value }}</span>
                      <input
                        v-model.number="formData.denominations[denom.key]"
                        type="number"
                        min="0"
                        placeholder="Qty"
                        class="w-full text-xs font-bold border-slate-200 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Coins Input -->
              <label class="block space-y-2">
                <span class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Coins ($)
                </span>
                <input
                  v-model.number="formData.cash_coins"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full font-bold border-slate-200 rounded-lg bg-white"
                  placeholder="0.00"
                />
              </label>

              <!-- Checks Input -->
              <div class="space-y-4">
                <label class="block space-y-2">
                  <span class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Checks ($)
                  </span>
                  <input
                    v-model.number="formData.checks_total"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full font-bold border-slate-200 rounded-lg bg-white"
                    placeholder="0.00"
                  />
                </label>

                <!-- Potential Problem Checks -->
                <label class="block space-y-2">
                  <span class="block text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Potential Problem Checks
                  </span>
                  <textarea
                    v-model="formData.potential_problem_checks"
                    rows="2"
                    class="w-full text-sm border-amber-200 bg-amber-50 rounded-lg focus:ring-amber-500 focus:border-amber-500 placeholder-amber-300"
                    placeholder="List any checks that might be risky..."
                  ></textarea>
                </label>
              </div>
            </div>
            
            <!-- Total Deposit Display -->
            <div class="flex justify-end pt-4 border-t border-slate-200">
              <div class="text-right">
                <div class="text-xs uppercase tracking-wider text-slate-500 font-bold">Total Deposit</div>
                <div class="text-3xl font-black text-primary-900">
                  ${{ formatCurrency(totalDeposit) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <button
              type="submit"
              class="px-8 py-3 bg-primary-600 text-white font-bold uppercase tracking-wider rounded-lg shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Saving...</span>
              <span v-else>Submit Shift Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import ShiftWizard from '~/components/admin/mic/ShiftWizard.vue';

const props = defineProps<{
  date: string;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
}>();

const viewMode = ref<'form' | 'workflow'>('form');
const enableCurrencyTracker = ref(false);
const isSubmitting = ref(false);

const denominations = [
  { key: 'bills_100', value: 100 },
  { key: 'bills_50', value: 50 },
  { key: 'bills_20', value: 20 },
  { key: 'bills_10', value: 10 },
  { key: 'bills_5', value: 5 },
  { key: 'bills_1', value: 1 },
];

const formData = reactive({
  headcount: 0,
  sales_pulltabs: 0,
  cash_currency: 0,
  cash_coins: 0,
  checks_total: 0,
  potential_problem_checks: '',
  denominations: {
    bills_100: 0,
    bills_50: 0,
    bills_20: 0,
    bills_10: 0,
    bills_5: 0,
    bills_1: 0,
  } as Record<string, number>,
  negative_bingo_reason: '',
});

const currencyTrackerTotal = computed(() => {
  return denominations.reduce((sum, denom) => {
    return sum + (formData.denominations[denom.key] || 0) * denom.value;
  }, 0);
});

const totalDeposit = computed(() => {
  const currency = enableCurrencyTracker.value ? currencyTrackerTotal.value : formData.cash_currency;
  return currency + (formData.cash_coins || 0) + (formData.checks_total || 0);
});

const calculatedBingo = computed(() => {
  return totalDeposit.value - formData.sales_pulltabs;
});

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const handleWorkflowSubmit = async (data: any) => {
  // Map workflow data to API payload
  // Assuming data structure from ShiftWizard
  // ...
  // For now, let's just log it or call the API
  await saveShift(data);
};

const handleFormSubmit = async () => {
  if (calculatedBingo.value < 0 && !formData.negative_bingo_reason) {
    alert("Please provide a reason for negative bingo sales.");
    return;
  }

  const payload = {
    date: props.date,
    headcount: formData.headcount,
    sales_bingo: calculatedBingo.value,
    sales_pulltabs: formData.sales_pulltabs,
    
    // Legacy/Redundant fields just in case
    pulltabs_total: formData.sales_pulltabs,
    bingo_total: calculatedBingo.value,
    
    // Deposit calculation
    deposit_total: totalDeposit.value,
    
    // Detailed breakdown
    cash_currency: enableCurrencyTracker.value ? currencyTrackerTotal.value : formData.cash_currency,
    cash_coins: formData.cash_coins,
    checks_total: formData.checks_total,
    potential_problem_checks: formData.potential_problem_checks,
    negative_bingo_reason: formData.negative_bingo_reason,
    
    // Denominations if tracked
    denominations: enableCurrencyTracker.value ? formData.denominations : null,
  };
  
  await saveShift(payload);
};

const saveShift = async (payload: any) => {
  isSubmitting.value = true;
  try {
    await $fetch('/api/admin/shift-records', {
      method: 'POST',
      body: payload,
    });
    emit('saved');
    // Reset form or show success
    alert('Shift saved successfully!');
  } catch (e) {
    console.error(e);
    alert('Error saving shift');
  } finally {
    isSubmitting.value = false;
  }
};

const loadExistingShift = async () => {
  try {
    // Attempt to load existing record for this date
    // Adjust endpoint/params as needed based on actual API
    const response = await $fetch<any[]>('/api/admin/shift-records', {
      params: { date: props.date }
    });
    
    // Assuming response is array, find match or take first if filtered
    const existing = Array.isArray(response) 
      ? response.find((r: any) => r.date === props.date) || (response.length === 1 ? response[0] : null)
      : response; // if object returned

    if (existing) {
      formData.headcount = existing.headcount || 0;
      formData.sales_pulltabs = existing.sales_pulltabs || 0;
      
      formData.cash_currency = existing.cash_currency || 0;
      formData.cash_coins = existing.cash_coins || 0;
      formData.checks_total = existing.checks_total || 0;
      formData.potential_problem_checks = existing.potential_problem_checks || '';
      formData.negative_bingo_reason = existing.negative_bingo_reason || '';
      
      if (existing.denominations) {
        formData.denominations = { ...formData.denominations, ...existing.denominations };
        enableCurrencyTracker.value = true;
      }
    }
  } catch (e) {
    console.warn("Could not load existing shift record (might be new):", e);
  }
};

onMounted(() => {
  loadExistingShift();
});
</script>
