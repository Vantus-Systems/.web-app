<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "../ui/BaseModal.vue";
import BingoPatternGrid from "./BingoPatternGrid.vue";

interface ProgramGame {
  sortOrder: number;
  title: string;
  paperColor: string;
  notes?: string;
  pattern: {
    slug: string;
    name: string;
    description?: string;
    isAnimated: boolean;
    definition: { frames: number[][]; interval?: number };
  };
}

interface Program {
  slug: string;
  name: string;
  description?: string;
  games: ProgramGame[];
}

const props = defineProps<{
  program: Program;
}>();

const selectedGame = ref<ProgramGame | null>(null);

const openGame = (game: ProgramGame) => {
  selectedGame.value = game;
};
</script>

<template>
  <div
    class="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-emerald-50/50 text-emerald-900">
          <tr>
            <th class="px-4 py-3 font-semibold">Game</th>
            <th class="px-4 py-3 font-semibold">Paper</th>
            <th class="px-4 py-3 font-semibold">Pattern</th>
            <th class="px-4 py-3 font-semibold text-right">View</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-emerald-900/5">
          <tr
            v-for="game in program.games"
            :key="game.sortOrder"
            class="group cursor-pointer hover:bg-emerald-50/30 transition-colors"
            @click="openGame(game)"
          >
            <td class="px-4 py-3 align-middle">
              <div class="font-medium text-emerald-950">{{ game.title }}</div>
              <div v-if="game.notes" class="text-xs text-neutral-500">
                {{ game.notes }}
              </div>
            </td>
            <td class="px-4 py-3 align-middle">
              <div class="flex items-center gap-2">
                <div
                  class="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                  :style="{ backgroundColor: game.paperColor }"
                ></div>
                <span class="text-xs text-neutral-600 hidden sm:inline-block">
                  <!-- Optional: display color hex or name if we had it, for now just swatch is good -->
                  {{ game.paperColor }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 align-middle">
              <span class="text-emerald-900">{{ game.pattern.name }}</span>
            </td>
            <td class="px-4 py-3 align-middle text-right">
              <div class="inline-block">
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

    <BaseModal
      :model-value="!!selectedGame"
      :title="selectedGame?.title || 'Game Details'"
      @update:model-value="(val) => !val && (selectedGame = null)"
    >
      <div v-if="selectedGame" class="flex flex-col items-center gap-6">
        <div class="flex items-center gap-2 text-sm text-neutral-600">
          <div
            class="h-4 w-4 rounded-full border border-black/10"
            :style="{ backgroundColor: selectedGame.paperColor }"
          ></div>
          <span>{{ selectedGame.paperColor }} Paper</span>
        </div>

        <BingoPatternGrid
          :name="selectedGame.pattern.name"
          :definition="selectedGame.pattern.definition"
          :fill-color="selectedGame.paperColor"
          size="md"
          :animate="true"
        />

        <div class="text-center">
          <h4 class="font-semibold text-emerald-900">
            {{ selectedGame.pattern.name }}
          </h4>
          <p
            v-if="selectedGame.pattern.description"
            class="mt-1 text-sm text-neutral-500"
          >
            {{ selectedGame.pattern.description }}
          </p>
        </div>

        <div
          v-if="selectedGame.notes"
          class="w-full rounded bg-emerald-50 p-3 text-center text-sm text-emerald-800"
        >
          {{ selectedGame.notes }}
        </div>
      </div>
    </BaseModal>
  </div>
</template>
