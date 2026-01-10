<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ArrowRight, Box } from "lucide-vue-next";

const programs = ref<any[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    programs.value = await $fetch("/api/programs");
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
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
        <span class="text-primary font-black uppercase tracking-[0.5em] text-xs mb-8 block">Combat Intel</span>
        <h1
          v-motion-fade-visible-once
          class="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase leading-none"
        >
          Session <span class="text-primary italic drop-shadow-[0_0_20px_rgba(78,221,97,0.5)]">Manifests</span>
        </h1>
        <p class="text-zinc-400 text-xl md:text-2xl max-w-2xl mx-auto font-bold uppercase tracking-widest">
          The tactical blueprint of every win.
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4 -mt-16 relative z-10">
      <div v-if="isLoading" class="flex items-center justify-center py-40">
        <div
          class="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        ></div>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink
          v-for="prog in programs"
          :key="prog.slug"
          :to="`/programs/${prog.slug}`"
          v-motion-slide-visible-once-bottom
          class="group relative bg-charcoal border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl transition-all duration-500 hover:border-primary/50 overflow-hidden block"
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

            <div
              class="text-primary font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-500"
            >
              Examine manifest
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
