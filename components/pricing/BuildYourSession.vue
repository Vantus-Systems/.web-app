<script setup lang="ts">
import { ref, computed } from "vue";
import { Calculator } from "lucide-vue-next";

// Props could be dynamic pricing data
const props = defineProps<{
  pricing?: any;
}>();

const playerCount = ref(1);
const paperOnly = ref(false);
const isSunday = ref(false); // Should default to today? Or just ask.

// Pricing constants (fallback defaults)
const BASE_PRICE = 35; // Example
const PAPER_DISCOUNT = 10;
const MACHINE_ADDON = 10;

// Calculate totals
const total = computed(() => {
  let perPerson = BASE_PRICE;

  if (paperOnly.value) {
    perPerson -= PAPER_DISCOUNT;
  }

  // Logic would normally come from props.pricing packages
  // This is a simplified "Guided" calculator as requested
  // "How many machines?" (1 / 2 / pay-as-you-go)
  // "Paper-only?"
  // "Sunday?"

  // Let's make it data driven if possible, otherwise use reasonable estimates/logic
  // derived from the pricing config passed in.

  // If we have pricing config:
  if (props.pricing?.packages) {
     // try to find cheapest machine package vs paper package
     // This logic can be complex.
     // For now, let's use the provided inputs to show a "Recommended Budget"
  }

  return perPerson * playerCount.value;
});

// We will implement a simplified view as requested:
// Inputs: "How many machines?", "Paper-only?", "Sunday?"
// Output: "Bring $X + expect these add-ons"

const machineCount = ref<number | 'pay-as-you-go'>(1);

const estimatedCost = computed(() => {
    // Logic to estimate cost based on inputs
    // This is illustrative, real logic should inspect `props.pricing`

    // Fallback values if no pricing data
    const machinePrice = 30;
    const paperPrice = 15;
    const sundayDiscount = isSunday.value ? 5 : 0;

    if (paperOnly.value) {
        return (paperPrice - sundayDiscount) * playerCount.value;
    }

    if (machineCount.value === 'pay-as-you-go') {
        return (paperPrice + 10) * playerCount.value; // electronic fee?
    }

    return ((machinePrice * (machineCount.value as number)) - sundayDiscount) * playerCount.value;
});

const details = computed(() => {
    const lines = [];
    if (paperOnly.value) lines.push("Paper packs for all players");
    else if (machineCount.value !== 'pay-as-you-go') lines.push(`${machineCount.value} Machine(s) per player`);

    if (isSunday.value) lines.push("Sunday Special Applied");

    return lines;
});
</script>

<template>
  <div class="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700">
    <div class="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
      <div class="p-2 bg-gold-500/20 rounded-lg text-gold-400">
        <Calculator class="w-5 h-5" />
      </div>
      <div>
        <h3 class="font-bold text-lg text-white">Build Your Session</h3>
        <p class="text-xs text-slate-400">Get a quick estimate</p>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Question 1: Players -->
      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">How many players?</label>
        <div class="flex gap-2">
            <button
                v-for="n in [1, 2, 3, 4]"
                :key="n"
                class="flex-1 py-2 rounded-lg text-sm font-bold border transition-colors"
                :class="playerCount === n ? 'bg-gold-500 border-gold-500 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'"
                @click="playerCount = n"
            >
                {{ n }}
            </button>
        </div>
      </div>

      <!-- Question 2: Style -->
      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Play Style</label>
        <div class="grid grid-cols-2 gap-2">
            <button
                class="py-2 px-3 rounded-lg text-sm font-bold border text-left transition-colors"
                :class="!paperOnly ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'"
                @click="paperOnly = false"
            >
                Machine
            </button>
            <button
                class="py-2 px-3 rounded-lg text-sm font-bold border text-left transition-colors"
                :class="paperOnly ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'"
                @click="paperOnly = true"
            >
                Paper Only
            </button>
        </div>
      </div>

       <!-- Question 3: Machine Count (if Machine) -->
       <div v-if="!paperOnly">
         <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Machines per player?</label>
          <div class="flex gap-2">
            <button
                v-for="n in [1, 2]"
                :key="n"
                class="flex-1 py-2 rounded-lg text-sm font-bold border transition-colors"
                :class="machineCount === n ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'"
                @click="machineCount = n"
            >
                {{ n }}
            </button>
             <button
                class="flex-1 py-2 rounded-lg text-sm font-bold border transition-colors"
                :class="machineCount === 'pay-as-you-go' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'"
                @click="machineCount = 'pay-as-you-go'"
            >
                Min
            </button>
        </div>
       </div>

      <!-- Result -->
      <div class="mt-8 pt-6 border-t border-slate-800">
        <div class="flex items-end justify-between mb-2">
            <span class="text-slate-400 text-sm">Estimated Total</span>
            <span class="text-2xl font-black text-gold-400">${{ estimatedCost }}</span>
        </div>
        <ul class="text-xs text-slate-400 space-y-1">
            <li v-for="line in details" :key="line" class="flex items-center gap-1.5">
                <div class="w-1 h-1 rounded-full bg-gold-500"></div>
                {{ line }}
            </li>
            <li class="flex items-center gap-1.5 opacity-60">
                <div class="w-1 h-1 rounded-full bg-slate-500"></div>
                Excludes daubers & concessions
            </li>
        </ul>
      </div>
    </div>
  </div>
</template>
