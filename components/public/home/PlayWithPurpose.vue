<template>
  <div
    class="bg-primary-900 text-white relative overflow-hidden py-16 md:py-24"
  >
    <!-- Background pattern/image -->
    <div
      class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"
    ></div>

    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-4xl mx-auto text-center">
        <h2
          class="text-gold-400 font-bold uppercase tracking-widest text-sm mb-4"
        >
          {{ mission.tagline }}
        </h2>
        <h3 class="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
          {{ mission.headline }}
        </h3>
        <p
          class="text-xl md:text-2xl text-primary-100 leading-relaxed max-w-2xl mx-auto mb-12"
        >
          {{ mission.body }}
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <NuxtLink
            to="/about"
            class="px-8 py-3 bg-white text-primary-900 font-bold rounded-full hover:bg-gold-400 transition-colors uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Learn More
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="px-8 py-3 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors uppercase tracking-wider"
          >
            Contact Us
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHomepageStore } from "~/stores/homepage";
import { storeToRefs } from "pinia";

const homepageStore = useHomepageStore();
const { settings } = storeToRefs(homepageStore);

const mission = computed(
  () =>
    settings.value?.mission || {
      headline: "PLAY WITH PURPOSE",
      body: "We are a volunteer-supported charity bingo hall. Every game you play supports local community programs.",
      tagline: "Win Big. Do Good.",
    },
);
</script>
