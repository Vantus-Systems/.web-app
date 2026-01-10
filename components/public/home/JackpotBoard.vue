<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="item in items"
      :key="item.id"
      class="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow relative group"
    >
      <div
        class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 to-gold-600"
      ></div>

      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold text-slate-800 leading-tight">
            {{ item.label }}
          </h3>
          <span
            v-if="item.playTime"
            class="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded"
          >
            {{ item.playTime }}
          </span>
        </div>

        <div class="flex items-baseline gap-1">
          <span
            class="text-3xl lg:text-4xl font-black text-primary-600 tracking-tight"
          >
            {{ formatCurrency(item.current) }}
          </span>
        </div>

        <div
          class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm"
        >
          <span class="text-slate-500">Must Go By</span>
          <span class="font-bold text-slate-700">{{
            item.mustGoBy ? formatCurrency(item.mustGoBy) : "N/A"
          }}</span>
        </div>
      </div>

      <!-- Shine effect -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
      ></div>
    </div>

    <!-- Fallback if empty -->
    <div
      v-if="items.length === 0"
      class="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200"
    >
      <p class="text-slate-400 font-medium">Jackpots loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJackpotStore } from "~/stores/jackpot";
import { storeToRefs } from "pinia";

const jackpotStore = useJackpotStore();
const { items } = storeToRefs(jackpotStore);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};
</script>
