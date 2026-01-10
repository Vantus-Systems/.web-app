<template>
  <section
    class="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-primary-950"
  >
    <!-- Background Video / Image -->
    <div class="absolute inset-0 w-full h-full">
      <video
        v-if="canPlayVideo && settings?.hero?.videoUrl"
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover opacity-60"
        :poster="settings.hero.posterUrl"
      >
        <source :src="settings.hero.videoUrl" type="video/mp4" />
      </video>
      <NuxtImg
        v-else-if="settings?.hero?.posterUrl"
        :src="settings.hero.posterUrl"
        class="absolute inset-0 w-full h-full object-cover opacity-40"
        alt="Bingo Hall Atmosphere"
      />
      <div
        v-else
        class="absolute inset-0 w-full h-full bg-primary-900 opacity-40"
      ></div>
    </div>

    <!-- Gradient Overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/60 to-transparent"
    ></div>
    <div
      class="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-transparent to-primary-950/80"
    ></div>

    <!-- Content -->
    <div class="container relative mx-auto px-4 text-center z-10 pt-20">
      <div v-motion-fade-visible class="max-w-5xl mx-auto">
        <h1
          class="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter leading-tight drop-shadow-2xl uppercase"
        >
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400"
          >
            {{
              settings?.hero?.headline || "Florida's Premier High-Stakes Bingo"
            }}
          </span>
        </h1>

        <p
          class="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
        >
          {{
            settings?.hero?.subheadline ||
            "Experience the thrill of big payouts in a state-of-the-art facility."
          }}
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <NuxtLink :to="settings?.hero?.primaryCta?.href || '/schedule'">
            <button
              class="bg-gold-500 hover:bg-gold-400 text-primary-950 font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-gold-500/20 transform hover:scale-105 transition-all duration-300 uppercase tracking-wider"
            >
              {{ settings?.hero?.primaryCta?.label || "Plan Your Visit" }}
            </button>
          </NuxtLink>

          <NuxtLink
            v-if="settings?.hero?.secondaryCta"
            :to="settings.hero.secondaryCta.href"
          >
            <button
              class="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold text-lg px-8 py-4 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 uppercase tracking-wider"
            >
              {{ settings.hero.secondaryCta.label }}
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useHomepageStore } from "~/stores/homepage";

const store = useHomepageStore();
const settings = computed(() => store.settings);

const canPlayVideo = ref(false);

onMounted(() => {
  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Check for save-data mode
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;
  const saveData = connection?.saveData === true;

  // Only play if enabled in settings + no reduced motion + no save data
  if (settings.value?.hero?.showVideo && !prefersReducedMotion && !saveData) {
    canPlayVideo.value = true;
  }
});
</script>
