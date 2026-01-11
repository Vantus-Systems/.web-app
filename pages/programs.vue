<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { ArrowRight, Box } from "lucide-vue-next";
import BaseButtonUpdated from "~/components/ui/BaseButtonUpdated.vue";
import { NuxtLink } from "#components";

const { data: programs, refresh, pending } = await useFetch<any[]>("/api/programs", {
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
      <div v-if="pending && programs.length === 0" class="flex items-center justify-center py-40">
        <div
          class="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        ></div>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="prog in programs"
          :key="prog.slug"
          v-motion-slide-visible-once-bottom
          class="group relative bg-charcoal border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 hover:border-primary/50 overflow-hidden"
        >
          <!-- Hover Glow -->
          <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="relative z-10">
            <div class="flex items-center justify-between mb-8">
              <div class="w-12 h-12 bg-black rounded-xl border border-zinc-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500">
                <Box class="w-6 h-6" />
              </div>
              <span
                class="bg-black text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20"
              >
                {{ prog.gameCount }} Patterns
              </span>
            </div>
            
            <h3
              class="text-4xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tighter mb-4"
            >
              {{ prog.name }}
            </h3>
            
            <p class="text-zinc-500 mb-10 font-bold leading-tight line-clamp-2">
              {{ prog.description || "Full session breakdown and prize structure." }}
            </p>

            <!-- View Program Button -->
            <div class="mt-auto">
              <NuxtLink
                :to="{ name: 'programs-slug', params: { slug: prog.slug } }"
                custom
                aria-label="View program details"
              >
                <template #default="{ navigate }">
                  <BaseButtonUpdated
                    variant="primary"
                    size="medium"
                    label="View Program"
                    class="w-full justify-center"
                    aria-label="View program details"
                    role="link"
                    @click="navigate"
                  >
                    <template #default>
                      <span class="inline-flex items-center gap-2">
                        View Program
                        <ArrowRight class="w-4 h-4" />
                      </span>
                    </template>
                  </BaseButtonUpdated>
                </template>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
