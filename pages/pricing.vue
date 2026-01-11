<script setup lang="ts">
import { ref, computed } from "vue";
import { 
  Ticket, 
  Monitor, 
  Zap, 
  Check, 
  Trophy, 
  Info 
} from "lucide-vue-next";

// Fetch pricing data
const { data: pricingData, pending, error, refresh } = await useFetch('/api/pricing');

// Currency formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Active Category State
const activeCategory = ref('machines');
const categories = [
  { id: 'machines', label: 'Electronic', icon: Monitor },
  { id: 'paper', label: 'Paper Packs', icon: Ticket },
  { id: 'extras', label: 'Extras', icon: Zap },
];

// Filtered Data
const filteredItems = computed(() => {
  if (!pricingData.value) return [];
  return pricingData.value[activeCategory.value] || [];
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
      <div v-if="pending" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-6 text-primary font-mono animate-pulse tracking-widest uppercase text-sm">Loading Rates...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20 bg-red-950/20 rounded-[3rem] border border-red-900/50 backdrop-blur-sm">
        <h3 class="text-2xl text-red-500 font-black uppercase tracking-widest mb-2">System Offline</h3>
        <p class="text-red-200/60 font-bold">Unable to retrieve pricing data.</p>
        <button @click="refresh" class="mt-8 px-8 py-3 bg-red-900/30 hover:bg-red-900/50 text-white rounded-full border border-red-800 uppercase text-xs font-black tracking-widest transition-all">
          Retry Connection
        </button>
      </div>

      <!-- Pricing Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(item, index) in filteredItems" 
          :key="index"
          v-motion-slide-visible-once-bottom
          :delay="index * 100"
          class="group relative bg-charcoal border rounded-[2.5rem] p-10 overflow-hidden transition-all duration-500 hover:-translate-y-2"
          :class="item.featured ? 'border-primary shadow-[0_0_50px_rgba(78,221,97,0.15)]' : 'border-zinc-900 hover:border-zinc-700'"
        >
          <!-- Featured Badge -->
          <div v-if="item.featured" class="absolute top-0 right-0 bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-bl-2xl">
            Best Value
          </div>

          <!-- Hover Glow -->
          <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <!-- Header -->
          <div class="relative z-10 mb-8">
            <h3 class="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
              {{ item.name }}
            </h3>
            <p class="text-zinc-500 text-sm font-bold uppercase tracking-wider">
              {{ item.description }}
            </p>
          </div>

          <!-- Price -->
          <div class="relative z-10 mb-8 flex items-baseline gap-2">
            <span class="text-5xl font-black text-white tracking-tighter">
              {{ formatCurrency(item.price) }}
            </span>
            <span v-if="item.unit" class="text-zinc-600 font-bold uppercase text-xs tracking-widest">
              / {{ item.unit }}
            </span>
          </div>

          <!-- Features List -->
          <ul class="relative z-10 space-y-4 mb-10">
            <li v-for="(feature, fIndex) in item.features" :key="fIndex" class="flex items-start gap-3">
              <div class="mt-1 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <Check class="w-2.5 h-2.5 text-primary" />
              </div>
              <span class="text-zinc-400 text-sm font-medium leading-tight group-hover:text-zinc-300 transition-colors">
                {{ feature }}
              </span>
            </li>
          </ul>

          <!-- Action -->
          <div class="relative z-10 mt-auto">
            <button class="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 flex items-center justify-center gap-2"
              :class="item.featured ? 'bg-primary text-black hover:bg-white shadow-lg shadow-primary/20' : 'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800'"
            >
              Select Package
            </button>
          </div>
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
