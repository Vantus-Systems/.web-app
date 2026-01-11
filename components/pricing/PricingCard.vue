<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ data: any }>();

const formatCurrency = (amount: any) => {
  if (amount === null || amount === undefined) return null;
  // If already a formatted string like "$22" or "22.00" just return it
  if (typeof amount === 'string') {
    // Simple heuristic: contains non-digit characters like $ or - or spaces
    if (/\D/.test(amount)) return amount;
    const num = Number(amount);
    if (!Number.isNaN(num)) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
    return amount;
  }

  const num = Number(amount);
  if (Number.isNaN(num)) return String(amount);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
};

const priceValue = computed(() => {
  const d = props.data || {};
  if (d.price !== undefined && d.price !== null) return d.price;
  if (d.priceFrom) return d.priceFrom;
  if (d.pricing) return d.pricing;
  if (d.machines && d.machines.length) return d.machines[0].price;
  if (d.priceRange) return d.priceRange;
  if (d.prices && Array.isArray(d.prices) && d.prices.length) return d.prices[0].price;
  return null;
});

const priceDisplay = computed(() => {
  const p = priceValue.value;
  if (p === null || p === undefined) return null;
  return formatCurrency(p);
});

const features = computed(() => {
  const d = props.data || {};
  if (Array.isArray(d.features)) return d.features;
  if (Array.isArray(d.bullets)) return d.bullets;
  if (Array.isArray(d.highlights)) return d.highlights;
  // Fallback: create list from known fields
  const list: string[] = [];
  if (d.unit) list.push(`Includes ${d.unit}`);
  if (d.description) list.push(d.description);
  return list;
});
</script>

<template>
  <div class="bg-charcoal border rounded-[2rem] p-6 overflow-hidden transition-shadow hover:shadow-xl relative">
    <div v-if="props.data?.featured" class="absolute top-0 right-0 bg-primary text-black px-4 py-2 rounded-bl-xl text-xs font-black uppercase tracking-wider">
      Best Value
    </div>

    <div class="mb-4">
      <h3 class="text-xl font-black uppercase tracking-tight">
        {{ props.data?.name || props.data?.title || props.data?.slug }}
      </h3>
      <p class="text-sm text-zinc-400 mt-1">{{ props.data?.description }}</p>
    </div>

    <div class="flex items-baseline gap-3 mb-4">
      <div class="text-3xl font-black text-primary">{{ priceDisplay }}</div>
      <div v-if="props.data?.unit" class="text-xs uppercase text-zinc-500">/ {{ props.data.unit }}</div>
    </div>

    <ul class="space-y-2 text-sm text-zinc-400 mb-6">
      <li v-for="(f, idx) in features" :key="idx" class="flex items-start gap-2">
        <div class="w-3 h-3 rounded-full bg-zinc-800 mt-1"></div>
        <div>{{ f }}</div>
      </li>
    </ul>

    <div class="mt-auto">
      <button class="w-full py-3 rounded-xl font-black uppercase tracking-[0.2em] text-xs bg-primary text-black hover:bg-white transition-all">
        Select Package
      </button>
    </div>
  </div>
</template>
