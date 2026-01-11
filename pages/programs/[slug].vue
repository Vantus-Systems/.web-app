<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProgramViewer from "~/components/bingo/ProgramViewer.vue";
import BaseBottomSheet from "~/components/ui/BaseBottomSheet.vue";
import BingoPatternGrid from "~/components/bingo/BingoPatternGrid.vue";

const route = useRoute();
const router = useRouter();

const { data: program, pending, error } = await useAsyncData(`program-${route.params.slug}`, () => $fetch(`/api/programs/${route.params.slug}`));

const selectedGame = ref<any>(null);

// Sync URL query to modal state
const updateSelectedGameFromQuery = () => {
  if (!program.value?.games) return;

  const gameQuery = route.query.game;
  if (gameQuery) {
    const game = program.value.games.find(
      (g: any) =>
        String(g.sortOrder) === String(gameQuery) ||
        g.pattern.slug === gameQuery,
    );
    if (game) {
      selectedGame.value = game;
    }
  } else {
    selectedGame.value = null;
  }
};

// Initial load
onMounted(() => {
  console.log('[DEBUG] Program page mounted, slug:', route.params.slug);
  console.log('[DEBUG] Route name:', route.name);
  console.log('[DEBUG] Program data:', program.value);
  console.log('[DEBUG] Pending:', pending.value);
  console.log('[DEBUG] Error:', error.value);
  updateSelectedGameFromQuery();
});

// Watch query changes
watch(
  () => route.query.game,
  () => {
    updateSelectedGameFromQuery();
  },
);

const openGame = (game: any) => {
  router.push({ query: { ...route.query, game: game.sortOrder } });
};

const closeGame = () => {
  const query = { ...route.query };
  delete query.game;
  router.push({ query });
};

useSeoMeta({
  title: computed(() =>
    program.value ? `${program.value.name} | Programs` : "Program Details",
  ),
  description: computed(
    () => program.value?.description || "View game details.",
  ),
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <!-- Header -->
    <div class="bg-slate-900 pt-32 pb-16 px-4 text-center">
      <div v-if="pending" class="animate-pulse">
        <div class="h-12 w-64 bg-slate-800 rounded mx-auto mb-4"></div>
        <div class="h-6 w-96 bg-slate-800 rounded mx-auto"></div>
      </div>
      <div v-else-if="error" class="text-center py-20">
        <h1 class="text-3xl font-bold text-red-500 mb-4">Error Loading Program</h1>
        <p class="text-zinc-400">{{ error.message }}</p>
      </div>
      <div v-else-if="program">
        <NuxtLink
          to="/programs"
          class="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Programs
        </NuxtLink>
        <h1
          class="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter"
        >
          {{ program.name }}
        </h1>
        <p class="text-slate-400 text-lg max-w-2xl mx-auto">
          {{ program.description }}
        </p>
      </div>
      <div v-else class="text-white">Program not found.</div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 -mt-10 relative z-10">
      <div v-if="program">
        <ProgramViewer :program="program" @select-game="openGame" />
      </div>
    </div>

    <!-- Game Detail Sheet -->
    <BaseBottomSheet
      :model-value="!!selectedGame"
      :title="selectedGame?.title"
      @update:model-value="(val) => !val && closeGame()"
    >
      <div v-if="selectedGame" class="flex flex-col gap-6 items-center pt-2">
        <!-- Paper Info -->
        <div
          class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600"
        >
          <div
            class="h-4 w-4 rounded-full border border-black/10 shadow-sm"
            :style="{ backgroundColor: selectedGame.paperColor }"
          ></div>
          {{ selectedGame.paperColor }} Paper
        </div>

        <!-- Pattern Visual -->
        <div
          class="p-6 bg-slate-50 rounded-xl border border-slate-100 shadow-inner"
        >
          <BingoPatternGrid
            :name="selectedGame.pattern.name"
            :definition="selectedGame.pattern.definition"
            :fill-color="selectedGame.paperColor"
            size="md"
            :animate="true"
          />
        </div>

        <!-- Details -->
        <div class="text-center max-w-sm">
          <h4 class="text-xl font-black text-slate-900 mb-2">
            {{ selectedGame.pattern.name }}
          </h4>
          <p
            v-if="selectedGame.pattern.description"
            class="text-slate-500 leading-relaxed"
          >
            {{ selectedGame.pattern.description }}
          </p>
        </div>

        <!-- Notes / Special Rules -->
        <div
          v-if="selectedGame.notes"
          class="w-full bg-emerald-50 text-emerald-900 p-4 rounded-xl text-center text-sm font-medium border border-emerald-100"
        >
          <span
            class="block text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1"
            >Game Notes</span
          >
          {{ selectedGame.notes }}
        </div>
      </div>
    </BaseBottomSheet>
  </div>
</template>
