<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
        <span class="text-xl">⚡</span> Quick Shift Report
      </h3>
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
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
          class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

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
      shift: "PM", // Defaulting to PM as it's the main shift usually
      net_pulltab_income: form.value.pulltabs_total,
      cash_total_manual: form.value.deposit_total,
      beginning_box: 0,
      ending_box: 0,
      headcount: 0,
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
