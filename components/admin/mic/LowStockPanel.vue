<template>
  <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Low Stock</p>
      <button
        class="text-xs text-primary-600 font-bold"
        @click="emit('create-supply')"
      >
        Request Supply
      </button>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="item in items"
        :key="item"
        type="button"
        class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 text-left"
        @click="$emit('create-supply', item)"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<["create-supply"]>();
const items = ["Tape", "Forms", "Pens", "Tubes", "Markers"];
</script>
