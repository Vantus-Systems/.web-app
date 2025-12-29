<template>
  <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
    <div>
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold">
        Summary
      </p>
      <h3 class="text-lg font-black text-primary-900">Week & Month</h3>
    </div>
    <div class="grid grid-cols-2 gap-3 text-xs">
      <div class="border border-slate-200 rounded-lg p-3">
        <div class="text-slate-400 uppercase tracking-widest text-[10px]">Week</div>
        <div class="text-lg font-bold text-slate-900">${{ weeklyTotal.toFixed(2) }}</div>
      </div>
      <div class="border border-slate-200 rounded-lg p-3">
        <div class="text-slate-400 uppercase tracking-widest text-[10px]">Month</div>
        <div class="text-lg font-bold text-slate-900">${{ monthlyTotal.toFixed(2) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  weekShifts: Array<{ deposit_total: number }>;
  monthShifts: Array<{ deposit_total: number }>;
}>();

const weeklyTotal = computed(() =>
  props.weekShifts.reduce((sum, shift) => sum + shift.deposit_total, 0),
);
const monthlyTotal = computed(() =>
  props.monthShifts.reduce((sum, shift) => sum + shift.deposit_total, 0),
);
</script>
