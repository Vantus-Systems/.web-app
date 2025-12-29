<template>
  <div class="h-full flex flex-col bg-white border-r border-slate-200">
    <div class="p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold">
            Palette
          </p>
          <h3 class="text-lg font-black text-primary-900">Rate Cards</h3>
        </div>
        <button
          class="text-xs font-bold text-primary-700 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-50"
          @click="$emit('add')"
        >
          + Add
        </button>
      </div>
      <input
        v-model="search"
        type="text"
        placeholder="Search..."
        class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-xs"
      />
    </div>
    <div class="px-4 pb-4 space-y-2 overflow-y-auto">
      <button
        v-for="card in filteredCards"
        :key="card.id"
        class="w-full text-left rounded-full border px-3 py-2 flex items-center justify-between gap-2"
        :class="card.id === selectedId
          ? 'border-primary-500 bg-primary-50'
          : 'border-slate-200 bg-white hover:border-slate-300'"
        draggable="true"
        @dragstart="handleDragStart(card, $event)"
        @click="$emit('select', { type: 'rateCard', id: card.id })"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-2 h-2 rounded-full"
            :style="{ backgroundColor: card.color || '#64748b' }"
          ></span>
          <div>
            <div class="text-sm font-bold text-slate-900">{{ card.name }}</div>
            <div class="text-[10px] uppercase tracking-widest text-slate-400">
              {{ card.category || card.yield_configuration.mode }}
            </div>
          </div>
        </div>
        <span class="text-[10px] text-slate-400">Drag</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { OpsSchemaRateCard } from "~/types/ops-schema";

const props = defineProps<{
  rateCards: OpsSchemaRateCard[];
  selectedId?: string | null;
}>();

defineEmits<{
  (e: "select", payload: { type: "rateCard"; id: string }): void;
  (e: "add"): void;
}>();

const search = ref("");

const filteredCards = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return props.rateCards;
  return props.rateCards.filter(
    (card) =>
      card.name.toLowerCase().includes(term) ||
      card.category?.toLowerCase().includes(term),
  );
});

const handleDragStart = (card: OpsSchemaRateCard, event: DragEvent) => {
  event.dataTransfer?.setData(
    "application/x-ops-ratecard",
    JSON.stringify({ id: card.id }),
  );
  event.dataTransfer?.setData("text/plain", card.id);
};
</script>
