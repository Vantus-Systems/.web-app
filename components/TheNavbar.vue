<script setup lang="ts">
import { ref } from "vue";
import { Menu, X, Share2 } from "lucide-vue-next";
import { useJackpotStore } from "~/stores/jackpot";
import TheSkipLink from "~/components/TheSkipLink.vue";

const jackpotStore = useJackpotStore();
const isMenuOpen = ref(false);

const links = [
  { name: "Hub", path: "/" },
  { name: "Schedule", path: "/schedule" },
  { name: "Programs", path: "/programs" },
  { name: "Pricing", path: "/pricing" },
  { name: "Community", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};
</script>

<template>
  <TheSkipLink />
  <header
    class="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/90 border-b border-primary/10 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
  >
    <div class="container mx-auto px-4 md:px-6">
      <div class="flex h-20 items-center justify-between">
        <!-- Brand Identity -->
        <NuxtLink to="/" class="flex items-center space-x-4 group">
          <div
            class="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center text-primary font-black text-2xl border-2 border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(78,221,97,0.5)] transition-all duration-500 overflow-hidden relative"
          >
            <div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            M
          </div>
          <div class="flex flex-col">
            <span
              class="text-lg font-black text-white uppercase tracking-[-0.05em] leading-none group-hover:text-primary transition-colors duration-300"
            >
              Mary Esther <span class="hidden sm:inline">Bingo</span>
            </span>
            <span class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] leading-none mt-1">
              Live Bingo Action
            </span>
          </div>
          <span class="sr-only">Home Hub</span>
        </NuxtLink>

        <!-- Main Navigation -->
        <nav
          class="hidden lg:flex items-center space-x-2"
          aria-label="Main Navigation"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.path"
            :to="link.path"
            class="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all rounded-lg px-4 py-2 outline-none relative group border border-transparent hover:border-primary/20"
            active-class="!text-primary bg-primary/10 border-primary/30"
          >
            {{ link.name }}
            <span class="absolute bottom-0 left-4 right-4 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 opacity-50"></span>
          </NuxtLink>
        </nav>

        <!-- Live Intelligence -->
        <div class="flex items-center gap-6">
          <ClientOnly>
            <div class="hidden sm:flex items-center gap-4 pl-6 border-l border-primary/20">
               <div class="text-right">
                  <p class="text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-black mb-0.5 flex items-center justify-end gap-1.5">
                    <span class="w-1 h-1 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(78,221,97,0.8)]"></span>
                    {{ jackpotStore.activeLabel }}
                  </p>
                  <p class="text-primary font-black font-mono text-xl tracking-tighter drop-shadow-[0_0_20px_rgba(78,221,97,0.6)] leading-none">
                    {{ formatCurrency(jackpotStore.currentJackpot) }}
                  </p>
               </div>
            </div>
          </ClientOnly>

          <!-- Mobile Control -->
          <button
            class="lg:hidden p-3 text-zinc-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-zinc-800 hover:border-primary/30 focus:outline-none shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            :aria-expanded="isMenuOpen"
            aria-controls="mobile-menu"
            aria-label="Open Operations Menu"
            @click="isMenuOpen = !isMenuOpen"
          >
            <Menu v-if="!isMenuOpen" class="w-6 h-6" aria-hidden="true" />
            <X v-else class="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <!-- Deployment Menu (Mobile) -->
    <div
      v-if="isMenuOpen"
      id="mobile-menu"
      v-motion-slide-top
      class="lg:hidden border-t border-primary/10 bg-black/98 backdrop-blur-2xl px-6 py-8 shadow-2xl shadow-black/80"
    >
      <nav class="flex flex-col space-y-2">
        <NuxtLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="text-xl font-black uppercase tracking-tighter text-zinc-400 hover:text-primary py-4 px-4 rounded-2xl hover:bg-primary/10 transition-all flex justify-between items-center group border border-transparent hover:border-primary/20"
          active-class="bg-primary/10 !text-primary border-primary/30"
          @click="isMenuOpen = false"
        >
          {{ link.name }}
          <span class="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(78,221,97,0.8)]"></span>
        </NuxtLink>
      </nav>
      
      <div class="mt-12 pt-8 border-t border-primary/10">
          <p class="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-4">Live Jackpot</p>
          <div class="flex items-center justify-between p-6 bg-zinc-900/50 border-2 border-primary/20 rounded-3xl shadow-[0_0_20px_rgba(78,221,97,0.2)]">
              <span class="text-zinc-400 font-black uppercase tracking-widest text-xs">{{ jackpotStore.activeLabel }}</span>
              <span class="text-2xl font-black text-primary font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(78,221,97,0.6)]">{{ formatCurrency(jackpotStore.currentJackpot) }}</span>
          </div>
      </div>
    </div>
  </header>
</template>
