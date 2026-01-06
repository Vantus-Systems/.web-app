<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
        <span class="text-xl">⚡</span> Quick Shift Report
      </h3>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-2 gap-4">
        <!-- Shift Selection -->
        <div>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
            >Shift</label
          >
          <div
            class="flex gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200"
          >
            <label class="flex-1 relative cursor-pointer">
              <input
                v-model="form.shift"
                type="radio"
                value="AM"
                class="peer sr-only"
              />
              <div
                class="text-center text-xs font-bold py-2 rounded-md text-slate-500 peer-checked:bg-white peer-checked:text-primary-700 peer-checked:shadow-sm transition-all"
              >
                AM
              </div>
            </label>
            <label class="flex-1 relative cursor-pointer">
              <input
                v-model="form.shift"
                type="radio"
                value="PM"
                class="peer sr-only"
              />
              <div
                class="text-center text-xs font-bold py-2 rounded-md text-slate-500 peer-checked:bg-white peer-checked:text-primary-700 peer-checked:shadow-sm transition-all"
              >
                PM
              </div>
            </label>
          </div>
        </div>
        <!-- Date -->
        <div>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
          >
            Date
          </label>
          <input
            v-model="form.date"
            type="date"
            required
            class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-[38px]"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Starting Box -->
        <div>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
            >Starting Box</label
          >
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono"
              >$</span
            >
            <input
              v-model.number="form.starting_box"
              type="number"
              step="0.01"
              required
              class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
        <!-- Ending Box -->
        <div>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
            >Ending Box</label
          >
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono"
              >$</span
            >
            <input
              v-model.number="form.ending_box"
              type="number"
              step="0.01"
              required
              class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Player Count (Conditional) -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="form.shift === 'PM'">
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
            >Player Count</label
          >
          <input
            v-model.number="form.player_count"
            type="number"
            min="0"
            class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </transition>

      <div class="grid grid-cols-2 gap-4">
        <!-- Pulltab Totals -->
        <div>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
          >
            Pulltab Total
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono"
              >$</span
            >
            <input
              v-model.number="form.pulltabs_total"
              type="number"
              step="0.01"
              required
              class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>

        <!-- Deposit -->
        <div>
          <label
            class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
          >
            Total Deposit
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono"
              >$</span
            >
            <input
              v-model.number="form.deposit_total"
              type="number"
              step="0.01"
              required
              class="w-full pl-7 rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Bingo Totals (Calculated) -->
      <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <label
          class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1"
        >
          Bingo Total
        </label>
        <div class="text-xl font-mono font-black text-primary-700">
          {{ formatCurrency(bingoTotal) }}
        </div>
        <p class="text-[10px] text-slate-400 mt-1">
          Calculated: Deposit - Pulltabs
        </p>
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

const emit = defineEmits(["saved"]);
const { getHeaders } = useCsrf();

const isSubmitting = ref(false);
const form = ref({
  date: new Date().toISOString().slice(0, 10),
  shift: "AM",
  starting_box: 4000,
  ending_box: 4000,
  player_count: 0,
  pulltabs_total: 0,
  deposit_total: 0,
});

const bingoTotal = computed(() => {
  return (form.value.deposit_total || 0) - (form.value.pulltabs_total || 0);
});

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      date: form.value.date,
      shift: form.value.shift,
      net_pulltab_income: form.value.pulltabs_total,
      cash_total_manual: form.value.deposit_total,
      beginning_box: form.value.starting_box,
      ending_box: form.value.ending_box,
      headcount: form.value.shift === "PM" ? form.value.player_count : 0,
    };

    await $fetch("/api/admin/mic/shifts", {
      method: "POST",
      body: payload,
      headers: getHeaders(),
      credentials: "include",
    });

    emit("saved");
    form.value = {
      date: new Date().toISOString().slice(0, 10),
      shift: "AM",
      starting_box: 4000,
      ending_box: 4000,
      player_count: 0,
      pulltabs_total: 0,
      deposit_total: 0,
    };
    alert("Shift submitted!");
  } catch (e: any) {
    alert(e.message || "Failed to submit");
  } finally {
    isSubmitting.value = false;
  }
};
</script>
