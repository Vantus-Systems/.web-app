<template>
  <TheSkipLink />
  <header
    class="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-slate-200 shadow-sm transition-all duration-300"
  >
    <div class="container mx-auto px-4 md:px-6">
      <div class="flex h-16 items-center justify-between">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <!-- Logo Placeholder -->
          <div
            class="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-gold font-bold text-xl border-2 border-gold"
            aria-hidden="true"
          >
            M
          </div>
          <span
            class="text-xl font-heading font-bold text-primary-900 hidden sm:inline-block"
          >
            Mary Esther Bingo
          </span>
          <span class="sr-only">Home</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav
          class="hidden md:flex items-center space-x-8"
          aria-label="Main Navigation"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.path"
            :to="link.path"
            class="text-sm font-medium text-slate-600 hover:text-primary-700 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md px-2 py-1 outline-none"
            active-class="text-primary-700 font-bold"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>

        <!-- CTA & Mobile Menu -->
        <div class="flex items-center gap-4">
          <div class="hidden sm:block text-right">
            <p
              class="text-[10px] text-slate-500 uppercase tracking-wider font-bold"
            >
              Current Jackpot
            </p>
            <p class="text-primary-700 font-bold font-mono">
              {{ formatCurrency(jackpotStore.currentJackpot) }}
            </p>
          </div>
          <button
            class="md:hidden p-2 text-slate-600 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :aria-expanded="isMenuOpen"
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            @click="isMenuOpen = !isMenuOpen"
          >
            <Menu v-if="!isMenuOpen" class="w-6 h-6" aria-hidden="true" />
            <X v-else class="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="isMenuOpen"
      id="mobile-menu"
      v-motion-slide-top
      class="md:hidden border-t border-slate-100 bg-white"
    >
      <nav class="flex flex-col p-4 space-y-4">
        <NuxtLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="text-lg font-medium text-slate-600 hover:text-primary-700 py-2 px-4 rounded-lg hover:bg-slate-50"
          active-class="bg-primary-50 text-primary-800 font-bold"
          @click="isMenuOpen = false"
        >
          {{ link.name }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Menu, X } from "lucide-vue-next";
import { useJackpotStore } from "~/stores/jackpot";
import TheSkipLink from "~/components/TheSkipLink.vue";

const jackpotStore = useJackpotStore();
const isMenuOpen = ref(false);

const links = [
  { name: "Home", path: "/" },
  { name: "Schedule", path: "/schedule" },
  { name: "Pricing", path: "/pricing" },
  { name: "About & Charities", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};
</script>
