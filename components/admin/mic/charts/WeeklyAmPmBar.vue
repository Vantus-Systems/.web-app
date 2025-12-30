<template>
  <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-xs uppercase tracking-[0.4em] text-slate-400">AM vs PM</p>
      <span class="text-xs text-slate-500">Last 7 days</span>
    </div>
    <div class="space-y-3">
      <div v-for="day in data" :key="day.label" class="space-y-1">
        <div class="flex justify-between text-xs text-slate-500">
          <span>{{ day.label }}</span>
          <span>${{ formatCurrency((day.am ?? 0) + (day.pm ?? 0), 2) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div
            class="bg-primary-100 h-3 rounded"
            :style="{ width: `${barWidth(day.am)}%` }"
          ></div>
          <div
            class="bg-slate-200 h-3 rounded"
            :style="{ width: `${barWidth(day.pm)}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-400">
          <span>AM: ${{ formatCurrency(day.am, 0) }}</span>
          <span>PM: ${{ formatCurrency(day.pm, 0) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  data: Array<{ label: string; am: number; pm: number }>;
}>();

const maxValue = computed(() => {
  if (!props.data.length) return 1;
  return (
    Math.max(
      ...props.data.map((day) =>
        Math.max(Number(day.am ?? 0), Number(day.pm ?? 0)),
      ),
    ) || 1
  );
});

const barWidth = (value: number) => {
  return Math.round((Number(value ?? 0) / maxValue.value) * 100);
};
</script>
