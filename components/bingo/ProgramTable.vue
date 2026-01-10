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

defineProps<{
  program: Program;
  condensed?: boolean;
}>();

const selectedGame = ref<ProgramGame | null>(null);

const openGame = (game: ProgramGame) => {
  selectedGame.value = game;
};
</script>

<template>
  <div
    class="overflow-hidden rounded-3xl border border-zinc-900 bg-black/40 backdrop-blur-md transition-all duration-500"
    :class="[condensed ? 'p-0 shadow-none border-none bg-transparent' : 'shadow-2xl shadow-black/50']"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-left text-[10px] uppercase font-black tracking-widest">
        <thead class="bg-zinc-900/50 text-zinc-500 border-b border-zinc-800">
          <tr>
            <th class="px-6 py-4">Manifest Item</th>
            <th class="px-6 py-4">Module</th>
            <th class="px-6 py-4">Configuration</th>
            <th class="px-6 py-4 text-right">Preview</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-900">
          <tr
            v-for="game in program.games"
            :key="game.sortOrder"
            class="group cursor-pointer hover:bg-white/5 transition-all duration-300"
            @click="openGame(game)"
          >
            <td class="px-6 py-4 align-middle">
              <div class="font-black text-white group-hover:text-primary transition-colors">{{ game.title }}</div>
              <div v-if="game.notes" class="text-[9px] text-zinc-600 mt-1 font-bold">
                {{ game.notes }}
              </div>
            </td>
            <td class="px-6 py-4 align-middle">
              <div class="flex items-center gap-3">
                <div
                  class="h-4 w-4 rounded-full border border-black/20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  :style="{ backgroundColor: game.paperColor }"
                ></div>
                <span class="text-zinc-500 hidden sm:inline-block">
                  {{ game.paperColor }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 align-middle">
              <span class="text-zinc-400 font-bold">{{ game.pattern.name }}</span>
            </td>
            <td class="px-6 py-4 align-middle text-right">
              <div class="inline-block opacity-80 group-hover:opacity-100 transition-opacity">
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

    <!-- Details Modal -->
    <BaseModal
      :model-value="!!selectedGame"
      :title="selectedGame?.title || 'Operational Intel'"
      @update:model-value="(val) => !val && (selectedGame = null)"
    >
      <div v-if="selectedGame" class="flex flex-col items-center gap-8 py-4">
        <div class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 bg-black/50 px-6 py-3 rounded-2xl border border-zinc-800">
          <div
            class="h-3 w-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,1)]"
            :style="{ backgroundColor: selectedGame.paperColor }"
          ></div>
          <span>Ref: {{ selectedGame.paperColor }} Module</span>
        </div>

        <div class="p-8 bg-black/40 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
            <BingoPatternGrid
              :name="selectedGame.pattern.name"
              :definition="selectedGame.pattern.definition"
              :fill-color="selectedGame.paperColor"
              size="md"
              :animate="true"
            />
        </div>

        <div class="text-center">
          <h4 class="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            {{ selectedGame.pattern.name }}
          </h4>
          <p
            v-if="selectedGame.pattern.description"
            class="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto"
          >
            {{ selectedGame.pattern.description }}
          </p>
        </div>

        <div
          v-if="selectedGame.notes"
          class="w-full rounded-2xl bg-primary/5 border border-primary/20 p-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary"
        >
          Note: {{ selectedGame.notes }}
        </div>
      </div>
    </BaseModal>
  </div>
</template>
