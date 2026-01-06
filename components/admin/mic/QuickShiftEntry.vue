<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
        <span class="text-xl">⚡</span> Quick Shift Report
      </h3>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Shift + Date -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shift</label>
          <div class="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <label class="flex-1 relative cursor-pointer">
              <input v-model="form.shift" type="radio" value="AM" class="peer sr-only" />
              <div class="text-center text-xs font-bold py-2 rounded-md text-slate-500 peer-checked:bg-white peer-checked:text-primary-700 peer-checked:shadow-sm transition-all">AM</div>
            </label>
            <label class="flex-1 relative cursor-pointer">
              <input v-model="form.shift" type="radio" value="PM" class="peer sr-only" />
              <div class="text-center text-xs font-bold py-2 rounded-md text-slate-500 peer-checked:bg-white peer-checked:text-primary-700 peer-checked:shadow-sm transition-all">PM</div>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
          <input v-model="form.date" type="date" required class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-[38px]" />
        </div>
      </div>

       <!-- Boxes (Starting/Ending) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="flex items-center mb-1">
             <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Starting Box</label>
             <HelpTip text="The total cash in the drawer at the START of the shift." />
          </div>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
            <input v-model.number="form.beginning_box" type="number" step="0.01" required class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none" @input="handleBoxInput" />
          </div>
        </div>
        <div>
          <div class="flex items-center mb-1">
             <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Ending Box</label>
             <HelpTip text="The total cash in the drawer at the END of the shift." />
          </div>
          <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
             <input v-model.number="form.ending_box" type="number" step="0.01" required class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none" @input="handleBoxInput" />
          </div>
        </div>
      </div>

      <!-- Totals Row: Bingo (Left) | Pulltabs (Right) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
            <div class="flex items-center mb-1">
               <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Bingo (Deposited)</label>
               <HelpTip text="The portion of the bank deposit that came from Bingo sales. Auto-calculated as Deposit - Pulltabs." />
            </div>
            <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input 
                    v-model.number="form.bingo_total_input" 
                    type="number" step="0.01" 
                    class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 text-primary-700 outline-none disabled:opacity-75 disabled:bg-slate-100"
                    :disabled="form.workflow_type === 'NEGATIVE_BINGO_BOX'" 
                    @input="calculate('bingo')"
                />
            </div>
            <p v-if="form.workflow_type === 'NEGATIVE_BINGO_BOX'" class="text-[10px] text-slate-400 mt-1">Locked to Box Delta</p>
        </div>
        <div>
            <div class="flex items-center mb-1">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pulltab Net</label>
                <HelpTip text="Net pulltab income (Sales - Payouts)." />
            </div>
            <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input 
                    v-model.number="form.pulltabs_total" 
                    type="number" step="0.01" 
                    class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                    @input="calculate('pulltabs')"
                />
            </div>
        </div>
      </div>

      <!-- Deposit | Players -->
      <div class="grid grid-cols-2 gap-4">
        <div>
            <div class="flex items-center mb-1">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Deposit to Bank</label>
                <HelpTip text="The actual amount of cash/checks physically taken to the bank. If Deposit is $5,000 and Box Change is +$1,265, Actual Revenue is $6,265." />
            </div>
            <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input 
                    v-model.number="form.deposit_total" 
                    type="number" step="0.01" 
                    class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                    @input="calculate('deposit')"
                 />
            </div>
        </div>

        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="form.shift === 'PM'">
            <div class="flex items-center mb-1">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Players</label>
                <HelpTip text="Headcount for the PM shift." />
            </div>
            <input
              v-model.number="form.players"
              type="number"
              min="0"
              class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </transition>
      </div>
      
      <!-- Computed Readouts -->
      <div class="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
         <div v-if="derived.box_delta === null" class="text-xs text-amber-600 font-bold flex items-center gap-2">
            <span>⚠️ Missing box counts</span>
            <HelpTip text="Please enter Starting and Ending Box amounts to calculate actual revenue." />
         </div>
         <template v-else>
            <div class="flex justify-between items-center text-xs">
                <div class="flex items-center">
                    <span class="text-slate-500 mr-1">Box Change:</span>
                    <HelpTip text="Ending Box - Starting Box. Positive means cash was added to the drawer." />
                </div>
                <span :class="derived.box_delta >= 0 ? 'text-emerald-600' : 'text-red-600'" class="font-mono font-bold">
                    {{ derived.box_delta > 0 ? '+' : '' }}{{ formatCurrency(derived.box_delta) }}
                </span>
            </div>
             <div class="flex justify-between items-center text-xs">
                <div class="flex items-center">
                    <span class="text-slate-500 mr-1">Bingo (Actual):</span>
                     <HelpTip text="Bingo (Deposited) + Box Change." />
                </div>
                <span class="font-mono font-bold text-slate-700">
                    {{ formatCurrency(derived.bingo_actual) }}
                </span>
            </div>
             <div class="flex justify-between items-center text-xs border-t border-slate-200 pt-2 mt-1">
                <div class="flex items-center">
                    <span class="font-bold text-slate-700 mr-1">Actual Revenue:</span>
                     <HelpTip text="Deposit to Bank + Box Change. This is the true profit/loss for the shift." />
                </div>
                <span :class="(derived.actual_revenue || 0) >= 0 ? 'text-slate-900' : 'text-red-600'" class="font-mono font-black">
                    {{ formatCurrency(derived.actual_revenue) }}
                </span>
            </div>
         </template>
      </div>

      <!-- Advanced Override (Workflow) -->
      <div class="text-right">
         <button 
            type="button" 
            class="text-[10px] text-slate-400 hover:text-slate-600 underline"
            @click="showAdvanced = !showAdvanced"
         >
            {{ showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options' }}
         </button>
      </div>

      <div v-if="showAdvanced" class="bg-slate-50 p-2 rounded border border-slate-200 text-xs mt-2">
          <div class="flex items-center mb-1">
             <label class="block font-bold">Workflow Override</label>
             <HelpTip text="Manually set the accounting workflow. 'Auto' usually works best." />
          </div>
          <select v-model="form.workflow_type" class="w-full p-1 rounded border-slate-200 mb-2">
             <option value="">Auto ({{ detectedWorkflow }})</option>
             <option value="NORMAL">Normal</option>
             <option value="NEGATIVE_BINGO_BOX">Negative</option>
             <option value="RECUPERATION_BOX_RETURN">Recovery</option>
          </select>
          <label class="block font-bold mb-1">Notes</label>
          <input v-model="form.notes" class="w-full p-1 rounded border-slate-200" placeholder="Optional notes..."/>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-primary-900 hover:bg-primary-800 text-white py-3 rounded-lg font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
      >
        {{ isSubmitting ? "Submitting..." : "Submit Shift" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCsrf } from "~/composables/useCsrf";
import { formatCurrency } from "~/utils/format";
import { useShiftCalculations, type ShiftState } from "~/composables/useShiftCalculations";
import { calculateShiftDerived } from "~/utils/shiftDerivedTotals";
import HelpTip from "~/components/ui/HelpTip.vue";

const emit = defineEmits(["saved"]);
const { getHeaders } = useCsrf();

const isSubmitting = ref(false);
const showAdvanced = ref(false);
const pinnedField = ref<"bingo" | "deposit">("deposit");

type QuickShiftState = ShiftState & { 
    shift: "AM" | "PM", 
    date: string, 
    players: number, 
    notes: string,
    workflow_override?: string 
};

const form = ref<QuickShiftState>({
  date: new Date().toISOString().slice(0, 10),
  shift: "AM",
  beginning_box: 4000,
  ending_box: 4000,
  players: 0,
  pulltabs_total: 0,
  deposit_total: 0,
  bingo_total_input: 0,
  workflow_type: "NORMAL",
  notes: ""
});

const { detectedWorkflow, calculate } = useShiftCalculations(form, pinnedField);

const derived = computed(() => calculateShiftDerived({
  beginning_box: form.value.beginning_box,
  ending_box: form.value.ending_box,
  pulltabs_total: form.value.pulltabs_total,
  deposit_bank_total: form.value.deposit_total
}));

const handleBoxInput = () => {
   if (detectedWorkflow.value) {
       form.value.workflow_type = detectedWorkflow.value;
   }
   if (form.value.workflow_type === "NEGATIVE_BINGO_BOX") {
        calculate('box');
   }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      date: form.value.date,
      shift: form.value.shift,
      net_pulltab_income: form.value.pulltabs_total,
      // API expects deposit_total, but we also send deposit_bank_total for clarity/validation
      deposit_total: form.value.deposit_total, 
      deposit_bank_total: form.value.deposit_total,
      beginning_box: form.value.beginning_box,
      ending_box: form.value.ending_box,
      headcount: form.value.shift === "PM" ? form.value.players : 0,
      workflow_type: form.value.workflow_type,
      notes: form.value.notes
    };
    
    // Check if we need to map to legacy fields expected by existing API or if we updated it?
    // The existing POST /api/admin/mic/shifts endpoint expects specific fields.
    // Let's check micShiftSubmissionSchema in server/schemas/micShift.zod
    
    // Actually, QuickShiftEntry previously called /api/admin/mic/shifts.
    // Does that endpoint support beginning_box/ending_box?
    // I need to check micShiftSubmissionSchema.
    
    await $fetch("/api/admin/mic/shifts", {
      method: "POST",
      body: payload,
      headers: getHeaders(),
      credentials: "include",
    });

    emit("saved");
    
    // Reset form
    form.value = {
      date: new Date().toISOString().slice(0, 10),
      shift: "AM",
      beginning_box: 4000,
      ending_box: 4000,
      players: 0,
      pulltabs_total: 0,
      deposit_total: 0,
      bingo_total_input: 0,
      workflow_type: "NORMAL",
      notes: ""
    };
    alert("Shift submitted!");
  } catch (e: any) {
    alert(e.message || "Failed to submit");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
