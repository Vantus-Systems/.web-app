<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import ProgramCard from "~/components/bingo/ProgramCard.vue";

const { data: programs, refresh, pending, error } = await useFetch<any[]>("/api/programs", {
  default: () => []
});

let pollInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  refresh();
  pollInterval = setInterval(() => {
    refresh();
  }, 30000);
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
});

useSeoMeta({
  title: "Programs | Mary Esther Bingo",
  description: "Browse our high-stakes bingo programs and game patterns.",
});
</script>

<template>
  <div class="bg-richBlack min-h-screen pb-40">
    <div class="relative bg-black pt-48 pb-32 px-4 overflow-hidden border-b border-zinc-900">
      <!-- Kinetic BG -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,221,97,0.1),transparent_70%)]"></div>
      </div>

      <div class="container mx-auto relative z-10 text-center">
        <span class="text-primary font-black uppercase tracking-[0.5em] text-xs mb-8 block">Game Info</span>
        <h1
          v-motion-fade-visible-once
          class="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase leading-none"
        >
          Game <span class="text-primary italic drop-shadow-[0_0_20px_rgba(78,221,97,0.5)]">Programs</span>
        </h1>
        <p class="text-zinc-400 text-xl md:text-2xl max-w-2xl mx-auto font-bold uppercase tracking-widest">
          Your Guide to Big Wins & Cash Prizes.
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4 -mt-16 relative z-10">
      <!-- Loading spinner (initial load) -->
      <div v-if="pending && programs.length === 0" class="flex items-center justify-center py-40">
        <div
          class="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
          aria-label="Loading programs"
        ></div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-red-300">
        <p class="font-bold">Unable to load programs.</p>
        <p class="text-sm opacity-80">Please try again. If the problem persists, contact support.</p>
      </div>

      <!-- Program grid -->
      <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <ProgramCard
          v-for="prog in programs"
          :key="prog.slug"
          v-motion-slide-visible-once-bottom
          :program="prog"
        />
      </div>
    </div>
  </div>
</template>
