<template>
  <div class="h-full flex flex-col bg-white border-r border-slate-200">
    <div
      class="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50"
    >
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
        Library
      </h3>
      <div class="flex gap-2">
        <button
          class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 rounded hover:border-primary-500 hover:text-primary-700 transition"
          @click="addRateCard"
        >
          + Card
        </button>
        <button
          class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 rounded hover:border-primary-500 hover:text-primary-700 transition"
          @click="addBundle"
        >
          + Bundle
        </button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <!-- Rate Cards -->
      <div>
        <h4
          class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3"
        >
          Rate Cards
        </h4>
        <div class="space-y-2">
          <div
            v-for="card in rateCards"
            :key="card.id"
            class="p-3 rounded-lg border cursor-pointer transition-all group"
            :class="
              selectedId === card.id
                ? 'border-gold bg-gold/5 shadow-sm'
                : 'border-slate-200 hover:border-gold/50 hover:shadow-sm'
            "
            @click="$emit('select', { type: 'rateCard', id: card.id })"
          >
            <div class="flex justify-between items-start mb-1">
              <div
                class="font-bold text-sm text-primary-900 leading-tight group-hover:text-primary-700"
              >
                {{ card.name || "Untitled Card" }}
              </div>
            </div>
            <div class="flex justify-between items-center">
              <div class="text-[10px] uppercase tracking-wide text-slate-500">
                {{ card.category || "General" }}
              </div>
              <div
                class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"
              >
                ${{ card.basePrice ?? 0 }}
              </div>
            </div>
          </div>
          <div
            v-if="rateCards.length === 0"
            class="text-xs text-slate-400 italic text-center py-4"
          >
            No rate cards defined
          </div>
        </div>
      </div>

      <!-- Bundles -->
      <div>
        <h4
          class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3"
        >
          Bundles
        </h4>
        <div class="space-y-2">
          <div
            v-for="bundle in bundles"
            :key="bundle.id"
            class="p-3 rounded-lg border cursor-pointer transition-all group"
            :class="
              selectedId === bundle.id
                ? 'border-gold bg-gold/5 shadow-sm'
                : 'border-slate-200 hover:border-gold/50 hover:shadow-sm'
            "
            @click="$emit('select', { type: 'bundle', id: bundle.id })"
          >
            <div class="flex justify-between items-start mb-1">
              <div
                class="font-bold text-sm text-primary-900 leading-tight group-hover:text-primary-700"
              >
                {{ bundle.name || "Untitled Bundle" }}
              </div>
            </div>
            <div class="flex justify-between items-center">
              <div class="text-[10px] uppercase tracking-wide text-slate-500">
                {{ bundle.rateCardIds?.length ?? 0 }} items
              </div>
              <div
                class="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"
              >
                ${{ bundle.price ?? 0 }}
              </div>
            </div>
          </div>
          <div
            v-if="bundles.length === 0"
            class="text-xs text-slate-400 italic text-center py-4"
          >
            No bundles defined
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Local type definitions: the external module does not export RateCard/Bundle
// so define minimal local types used by this component.
type RateCard = {
  id: string;
  name?: string;
  category?: string;
  basePrice?: number | null;
};

type Bundle = {
  id: string;
  name?: string;
  rateCardIds?: string[] | null;
  price?: number | null;
};

defineProps<{
  rateCards: RateCard[];
  bundles: Bundle[];
  selectedId?: string;
}>();

const emit = defineEmits(["select", "addRateCard", "addBundle"]);

const addRateCard = () => emit("addRateCard");
const addBundle = () => emit("addBundle");
</script>
