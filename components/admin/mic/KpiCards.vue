<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400">
        Deposit (Week)
      </p>
      <h3 class="text-3xl font-black" :class="depositBalanceClass">
        {{ formattedDeposit }}
      </h3>
      <p class="text-xs text-slate-500">
        Variance:
        <span class="font-semibold">${{ formatCurrency(variance, 2) }}</span>
      </p>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400">
        Headcount
      </p>
      <h3 class="text-3xl font-black text-primary-900">{{ headcount }}</h3>
      <p class="text-xs text-slate-500">Trend: {{ headcountTrend }}</p>
    </div>
    <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400">
        Spend / Head
      </p>
      <h3 class="text-3xl font-black text-primary-900">
        ${{ formatCurrency(spendPerHead, 2) }}
      </h3>
      <p class="text-xs text-slate-500">{{ spendMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  deposit_total: number;
  variance: number;
  headcount: number;
  headcountTrend: string;
}>();

const formattedDeposit = computed(() => {
  return `$${formatCurrency(props.deposit_total, 2)}`;
});

const spendPerHead = computed(() => {
  if (props.headcount === 0) return 0;
  return props.deposit_total / props.headcount;
});

const depositBalanceClass = computed(() => {
  return props.variance === 0 ? "text-emerald-700" : "text-rose-700";
});

const spendMessage = computed(() => {
  if (spendPerHead.value > 50) return "High spend per head";
  if (spendPerHead.value < 20) return "Lean spend";
  return "Balanced";
});
</script>
