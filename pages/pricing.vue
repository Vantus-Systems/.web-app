<script setup lang="ts">
import { ref, computed } from "vue";
import { Ticket, Monitor, Zap, Trophy, Info } from "lucide-vue-next";
import { useBingoData } from '../useBingoData';

const { pricing, currentPricing, allPricing, loading, refresh } = useBingoData();

const activeCategory = ref("machines");
const categories = [
  { id: "machines", label: "Electronic", icon: Monitor },
  { id: "paper", label: "Paper Packs", icon: Ticket },
  { id: "extras", label: "Extras", icon: Zap }
];

const activeCategoryLabel = computed(() => {
  return categories.find((cat) => cat.id === activeCategory.value)?.label ?? categories[0].label;
});

const filteredItems = computed(() => {
  const dataset = pricing.value?.[activeCategory.value];
  if (!Array.isArray(dataset)) return [];
  return dataset.map((item) => ({ ...item, category: activeCategory.value }));
});

const hasError = computed(() => {
  return !loading.value && (!pricing.value || allPricing.value.length === 0);
});

useSeoMeta({
  title: "Buy-Ins & Pricing | Mary Esther Bingo",
  description: "View our electronic and paper bingo packages. High stakes, big payouts.",
});
</script>

<template>
  <div class="bg-richBlack min-h-screen font-sans selection:bg-primary/20 text-white pb-40">
    
    <!-- Hero Section -->
    <div class="relative h-[50vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-black border-b border-primary/10 pb-12">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,221,97,0.15),transparent_70%)]"></div>
        <div class="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10 text-center">
        <div v-motion-pop-visible-once class="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-md border border-primary/20 px-6 py-2 rounded-full mb-8">
          <Trophy class="w-4 h-4 text-primary" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Official Rates</span>
        </div>
        
        <h1 v-motion-fade-visible-once class="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
          Player <span class="text-primary italic drop-shadow-[0_0_30px_rgba(78,221,97,0.4)]">Buy-Ins</span>
        </h1>
        
        <p v-motion-fade-visible-once class="text-zinc-400 max-w-2xl mx-auto text-xl md:text-2xl font-bold uppercase tracking-widest">
          Choose your weapon. <span class="text-white">Play to win.</span>
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 -mt-20 relative z-20">
      
      <!-- Category Navigation -->
      <div class="flex justify-center mb-16">
        <div class="bg-charcoal/80 backdrop-blur-xl border border-zinc-800 p-2 rounded-full shadow-2xl flex items-center gap-2 overflow-x-auto max-w-full">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-300 group whitespace-nowrap"
            :class="activeCategory === cat.id ? 'bg-primary text-black shadow-[0_0_20px_rgba(78,221,97,0.4)]' : 'hover:bg-white/5 text-zinc-400 hover:text-white'"
          >
            <component :is="cat.icon" class="w-5 h-5" :class="activeCategory === cat.id ? 'stroke-2' : 'stroke-1'" />
            <span class="font-black uppercase tracking-[0.2em] text-xs">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-6 text-primary font-mono animate-pulse tracking-widest uppercase text-sm">Loading Rates...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="text-center py-20 bg-red-950/20 rounded-[3rem] border border-red-900/50 backdrop-blur-sm">
        <h3 class="text-2xl text-red-500 font-black uppercase tracking-widest mb-2">System Offline</h3>
        <p class="text-red-200/60 font-bold">Unable to retrieve pricing data.</p>
        <button @click="refresh" class="mt-8 px-8 py-3 bg-red-900/30 hover:bg-red-900/50 text-white rounded-full border border-red-800 uppercase text-xs font-black tracking-widest transition-all">
          Retry Connection
        </button>
      </div>

      <!-- Pricing Grid / Composable Driven -->
      <div v-else class="space-y-12">
        <div v-if="currentPricing" class="grid gap-6 lg:grid-cols-[1fr_1.5fr] items-start">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.4em] text-primary">Featured</p>
            <h2 class="text-3xl font-black uppercase tracking-tight">Package Spotlight</h2>
            <p class="text-sm text-zinc-400">The most sought-after package powered by today’s rates.</p>
          </div>
          <PricingCard :data="currentPricing" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold uppercase tracking-tight">{{ activeCategoryLabel }} Packages</h2>
            <span class="text-xs uppercase tracking-[0.4em] text-zinc-400">
              {{ filteredItems.length }} option<span v-if="filteredItems.length !== 1">s</span>
            </span>
          </div>
          <div v-if="filteredItems.length" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PricingCard
              v-for="(item, idx) in filteredItems"
              :key="item.id ?? item.slug ?? `${activeCategory}-${idx}`"
              :data="item"
            />
          </div>
          <p v-else class="text-zinc-500 text-sm uppercase tracking-[0.4em] text-center mt-6">
            No packages available for this category yet.
          </p>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="mt-20 flex items-start gap-4 max-w-3xl mx-auto bg-black/50 border border-zinc-900/50 p-6 rounded-2xl backdrop-blur-sm">
        <Info class="w-6 h-6 text-zinc-600 shrink-0" />
        <p class="text-xs text-zinc-500 leading-relaxed font-medium">
          <strong class="text-zinc-400 uppercase tracking-wider block mb-1">House Rules Apply</strong>
          Prices subject to change without notice. "Electronic" packages include machine rental fee. All players must have a valid admission ticket. Minimum buy-in requirements may apply for special events.
        </p>
      </div>

    </div>
  </div>
</template>
