<script setup lang="ts">
import BingoPatternGrid from "./BingoPatternGrid.vue";

defineProps<{
  games: any[];
}>();

const emit = defineEmits(["select-game"]);
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
  >
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 text-slate-700">
        <tr>
          <th class="px-6 py-4 font-bold uppercase tracking-wider text-xs">
            Game
          </th>
          <th class="px-6 py-4 font-bold uppercase tracking-wider text-xs">
            Pattern
          </th>
          <th class="px-6 py-4 font-bold uppercase tracking-wider text-xs">
            Paper
          </th>
          <th
            class="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right"
          >
            Preview
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr
          v-for="game in games"
          :key="game.sortOrder"
          class="group cursor-pointer hover:bg-slate-50 transition-colors"
          @click="emit('select-game', game)"
        >
          <td class="px-6 py-4 align-middle">
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500"
              >
                {{ game.sortOrder }}
              </div>
              <div>
                <div class="font-bold text-slate-900 text-base">
                  {{ game.title }}
                </div>
                <div v-if="game.notes" class="text-xs text-slate-500 mt-0.5">
                  {{ game.notes }}
                </div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 align-middle">
            <span class="font-medium text-slate-700">{{
              game.pattern.name
            }}</span>
            <div
              v-if="game.prize_override"
              class="text-xs font-bold text-emerald-600 mt-0.5"
            >
              {{ game.prize_override }}
            </div>
          </td>
          <td class="px-6 py-4 align-middle">
            <div class="flex items-center gap-2">
              <div
                class="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                :style="{ backgroundColor: game.paperColor }"
                :title="game.paperColor"
              ></div>
              <span class="text-slate-600 font-medium">{{
                game.paperColor
              }}</span>
            </div>
          </td>
          <td class="px-6 py-4 align-middle text-right">
            <div
              class="inline-block opacity-80 group-hover:opacity-100 transition-opacity"
            >
              <BingoPatternGrid
                :name="game.pattern.name"
                :definition="game.pattern.definition"
                :fill-color="game.paperColor"
                size="xs"
                :animate="false"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
