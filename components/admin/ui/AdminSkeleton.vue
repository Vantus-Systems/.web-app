<template>
  <div class="animate-pulse space-y-4">
    <div v-if="variant === 'card'" class="bg-white rounded-xl p-6 space-y-4">
      <div class="h-4 bg-slate-200 rounded w-1/4"></div>
      <div class="space-y-3">
        <div class="h-3 bg-slate-200 rounded"></div>
        <div class="h-3 bg-slate-200 rounded w-5/6"></div>
        <div class="h-3 bg-slate-200 rounded w-4/6"></div>
      </div>
    </div>

    <div v-else-if="variant === 'table'" class="space-y-3">
      <div class="h-10 bg-slate-200 rounded"></div>
      <div v-for="i in rows" :key="i" class="h-16 bg-slate-100 rounded"></div>
    </div>

    <div v-else-if="variant === 'form'" class="space-y-6">
      <div v-for="i in rows" :key="i" class="space-y-2">
        <div class="h-4 bg-slate-200 rounded w-1/4"></div>
        <div class="h-10 bg-slate-100 rounded"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div class="h-4 bg-slate-200 rounded w-3/4"></div>
      <div class="h-4 bg-slate-200 rounded"></div>
      <div class="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "card" | "table" | "form" | "text";
    rows?: number;
  }>(),
  {
    variant: "text",
    rows: 3,
  },
);
</script>
