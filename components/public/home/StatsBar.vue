<template>
  <section
    v-if="settings?.statsBar?.enabled && settings.statsBar.items.length > 0"
    class="bg-primary-900 py-12 relative z-20 -mt-8 mx-4 rounded-xl shadow-2xl shadow-black/20 border border-white/5"
  >
    <div class="container mx-auto px-4">
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10"
      >
        <div
          v-for="(item, idx) in settings.statsBar.items"
          :key="idx"
          class="text-center px-4 py-4 md:py-0"
        >
          <div
            class="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight"
          >
            {{ item.big }}
          </div>
          <div
            class="text-sm md:text-base text-gold-400 font-bold uppercase tracking-widest"
          >
            {{ item.small }}
          </div>
          <div v-if="item.note" class="text-xs text-slate-400 mt-2">
            {{ item.note }}
          </div>
        </div>
      </div>

      <div v-if="settings?.statsBar?.asOfDate" class="text-center mt-8">
        <span class="text-xs text-slate-500 uppercase tracking-widest">
          Stats accurate as of {{ settings.statsBar.asOfDate }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHomepageStore } from "~/stores/homepage";

const store = useHomepageStore();
const settings = computed(() => store.settings);
</script>
