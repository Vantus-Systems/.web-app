<script setup lang="ts">
import { ref, onMounted } from "vue";
import ProgramTable from "~/components/bingo/ProgramTable.vue";
import BaseModal from "~/components/ui/BaseModal.vue";

const programs = ref<any[]>([]);
const selectedProgram = ref<any>(null);
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

const openProgram = async (slug: string) => {
  try {
    const prog = await $fetch(`/api/programs/${slug}`);
    selectedProgram.value = prog;
  } catch (e) {
    console.error(e);
  }
};

useSeoMeta({
  title: "Programs | Mary Esther Bingo",
  description: "Browse our bingo programs and game patterns.",
});
</script>

<template>
  <div class="bg-slate-50 min-h-screen pb-20">
    <div class="bg-slate-900 pt-32 pb-20 px-4 text-center">
      <h1
        class="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter"
      >
        Game <span class="text-gold-400">Programs</span>
      </h1>
      <p class="text-slate-400 text-lg max-w-2xl mx-auto">
        Explore our exciting lineup of games and patterns.
      </p>
    </div>

    <div class="container mx-auto px-4 -mt-10 relative z-10">
      <div v-if="isLoading" class="text-center py-20">
        <div
          class="animate-spin h-8 w-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto"
        ></div>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="prog in programs"
          :key="prog.slug"
          class="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 hover:-translate-y-1 transition-transform cursor-pointer group"
          @click="openProgram(prog.slug)"
        >
          <div class="flex items-center justify-between mb-4">
            <h3
              class="text-2xl font-black text-slate-900 group-hover:text-primary-700 transition-colors"
            >
              {{ prog.name }}
            </h3>
            <span
              class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              {{ prog.gameCount }} Games
            </span>
          </div>
          <p class="text-slate-500 mb-6">
            {{ prog.description || "No description available." }}
          </p>
          <div
            class="text-primary-600 font-bold text-sm flex items-center gap-2"
          >
            View Program
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
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      :model-value="!!selectedProgram"
      :title="selectedProgram?.name"
      @update:model-value="(val) => !val && (selectedProgram = null)"
    >
      <div v-if="selectedProgram" class="min-w-[600px] max-w-full">
        <p class="text-slate-500 mb-6">{{ selectedProgram.description }}</p>
        <ProgramTable :program="selectedProgram" />
      </div>
    </BaseModal>
  </div>
</template>
