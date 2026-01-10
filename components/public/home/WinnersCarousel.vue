<template>
  <section
    v-if="settings?.winners?.enabled && winners.length > 0"
    class="py-24 bg-white overflow-hidden"
  >
    <div class="container mx-auto px-4">
      <div class="flex items-end justify-between mb-12">
        <div>
          <h2 class="text-4xl font-black text-primary-900 tracking-tight mb-2">
            RECENT WINNERS
          </h2>
          <p class="text-slate-500 text-lg">
            Real people. Real life-changing moments.
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="p-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            aria-label="Previous winner"
            @click="scrollLeft"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            class="p-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            aria-label="Next winner"
            @click="scrollRight"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref="carousel"
        class="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 scrollbar-hide"
      >
        <div
          v-for="(winner, idx) in winners"
          :key="idx"
          class="snap-center shrink-0 w-[85vw] md:w-[400px]"
        >
          <div
            class="bg-slate-50 rounded-2xl p-8 border border-slate-100 h-full flex flex-col relative"
          >
            <div
              class="absolute top-6 right-6 text-6xl text-slate-200 font-serif leading-none select-none"
            >
              "
            </div>

            <div class="mb-6 flex items-center gap-4">
              <div
                class="w-16 h-16 rounded-full bg-gold-200 flex items-center justify-center text-gold-700 font-bold text-2xl"
              >
                {{ winner.name.charAt(0) }}
              </div>
              <div>
                <h3 class="font-bold text-primary-900 text-lg">
                  {{ winner.name }}
                </h3>
                <p class="text-gold-600 font-bold">{{ winner.amount }}</p>
              </div>
            </div>

            <p
              v-if="winner.quote"
              class="text-slate-600 italic text-lg mb-6 flex-grow"
            >
              {{ winner.quote }}
            </p>
            <p v-else class="text-slate-400 italic mb-6 flex-grow">
              Congratulations on the big win!
            </p>

            <div
              class="text-xs text-slate-400 font-medium uppercase tracking-wider"
            >
              {{ winner.date }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useHomepageStore } from "~/stores/homepage";

const store = useHomepageStore();
const settings = computed(() => store.settings);
const winners = computed(() => settings.value?.winners?.items || []);

const carousel = ref<HTMLElement | null>(null);

const scrollLeft = () => {
  if (carousel.value) {
    carousel.value.scrollBy({ left: -300, behavior: "smooth" });
  }
};

const scrollRight = () => {
  if (carousel.value) {
    carousel.value.scrollBy({ left: 300, behavior: "smooth" });
  }
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
