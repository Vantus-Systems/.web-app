<template>
  <div class="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
    <div class="flex items-center justify-between">
      <p class="text-xs uppercase tracking-[0.4em] text-slate-400">
        Pull Tab Trend
      </p>
      <span class="text-xs text-slate-500">30 days</span>
    </div>
    <svg viewBox="0 0 320 120" class="w-full h-32">
      <polyline
        v-if="points.length"
        :points="points"
        fill="none"
        stroke="#0b7ef7"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        v-for="(point, idx) in pointsArray"
        :key="idx"
        :cx="point.x"
        :cy="point.y"
        r="3"
        fill="#0b7ef7"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  data: Array<{ label: string; value: number }>;
}>();

const boundedData = computed(() => props.data.slice(-30));

const maxValue = computed(() => {
  if (!boundedData.value.length) return 1;
  return Math.max(...boundedData.value.map((point) => point.value)) || 1;
});

const width = 320;
const height = 120;

const pointsArray = computed(() => {
  return boundedData.value.map((point, idx) => {
    const x = (idx / (boundedData.value.length - 1 || 1)) * width;
    const y = height - (point.value / maxValue.value) * height;
    return { x, y };
  });
});

const points = computed(() =>
  pointsArray.value.map((point) => `${point.x},${point.y}`).join(" "),
);
</script>
