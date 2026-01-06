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
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Starting Box</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
            <input v-model.number="form.beginning_box" type="number" step="0.01" required class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none" @input="handleBoxInput" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ending Box</label>
          <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
             <input v-model.number="form.ending_box" type="number" step="0.01" required class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none" @input="handleBoxInput" />
          </div>
        </div>
      </div>

      <!-- Totals Row: Bingo (Left) | Pulltabs (Right) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bingo Total</label>
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
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pulltab Total</label>
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
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Deposit Total</label>
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
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Players</label>
            <input
              v-model.number="form.players"
              type="number"
              min="0"
              class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </transition>
      </div>
      
      <!-- Actuals / Workflow Badge -->
      <div class="flex items-center justify-between text-[10px] text-slate-400 border-t pt-2 mt-2">
         <div class="flex flex-col">
            <span>Workflow: <strong class="text-slate-600">{{ detectedWorkflow }}</strong></span>
            <span>Actual: <strong>{{ formatCurrency(bingoActual) }}</strong> Bingo / <strong>{{ formatCurrency(depositActual) }}</strong> Dep</span>
         </div>
         <button 
            type="button" 
            class="text-primary-600 hover:text-primary-800 underline"
            @click="showAdvanced = !showAdvanced"
         >
            {{ showAdvanced ? 'Hide Advanced' : 'Advanced' }}
         </button>
      </div>

      <!-- Advanced Override (Workflow) -->
      <div v-if="showAdvanced" class="bg-slate-50 p-2 rounded border border-slate-200 text-xs">
          <label class="block font-bold mb-1">Workflow Override</label>
          <select v-model="form.workflow_type" class="w-full p-1 rounded border-slate-200">
             <option value="">Auto ({{ detectedWorkflow }})</option>
             <option value="NORMAL">Normal</option>
             <option value="NEGATIVE_BINGO_BOX">Negative</option>
             <option value="RECUPERATION_BOX_RETURN">Recovery</option>
          </select>
          <label class="block font-bold mt-2 mb-1">Notes</label>
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
    // Add raw binding field for workflow override (nullable means auto)
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
  workflow_type: "NORMAL", // We bind to this, but manage it via detection
  notes: ""
});

const { detectedWorkflow, bingoActual, depositActual, calculate } = useShiftCalculations(form, pinnedField);

const handleBoxInput = () => {
   // Auto-update workflow if user hasn't hard-overridden (or even if they have, we might prioritize detection unless locked)
   // Here we'll treat workflow_type as the source of truth, but update it when boxes denote a specific state
   // assuming default usage.
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
      pulltabs_total: form.value.pulltabs_total,
      deposit_total: form.value.deposit_total,
      players: form.value.shift === "PM" ? form.value.players : 0,
      workflow_type: form.value.workflow_type,
      beginning_box: form.value.beginning_box,
      ending_box: form.value.ending_box,
      bingo_actual: bingoActual.value,
      deposit_actual: depositActual.value,
      notes: form.value.notes
    };

    await $fetch("/api/admin/shift-records", {
      method: "POST",
      body: payload,
      headers: getHeaders(),
      credentials: "include", // Ensure session/csrf cookies sent
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
    pinnedField.value = "deposit";
    alert("Shift submitted!");
  } catch (e: any) {
    alert(e.message || "Failed to submit");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
