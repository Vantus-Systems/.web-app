<script setup lang="ts">
import BingoPatternGrid from "./BingoPatternGrid.vue";

defineProps<{
  games: any[];
}>();

const emit = defineEmits(["select-game"]);
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="game in games"
      :key="game.sortOrder"
      class="relative flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
      @click="emit('select-game', game)"
    >
      <!-- Number Badge -->
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 font-bold text-slate-500 border border-slate-100">
        {{ game.sortOrder }}
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-slate-900 truncate">{{ game.title }}</h4>
        <div class="flex items-center gap-2 mt-1">
          <div
            class="h-3 w-3 rounded-full border border-black/10"
            :style="{ backgroundColor: game.paperColor }"
          ></div>
          <span class="text-xs text-slate-500 truncate">{{ game.pattern.name }}</span>
        </div>
      </div>

      <!-- Preview -->
      <div class="shrink-0">
        <BingoPatternGrid
          :name="game.pattern.name"
          :definition="game.pattern.definition"
          :fill-color="game.paperColor"
          size="xs"
          :animate="false"
        />
      </div>

      <!-- Chevron -->
      <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0">
        <!-- Hidden but implied tappability -->
      </div>
    </div>
  </div>
</template>
