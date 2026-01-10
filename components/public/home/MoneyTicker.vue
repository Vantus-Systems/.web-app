<template>
  <div
    v-if="settings?.ticker?.enabled"
    class="bg-primary-950 border-y border-white/10 overflow-hidden relative h-12 flex items-center"
  >
    <div class="ticker-wrap w-full overflow-hidden">
      <div class="ticker">
        <!-- Loop items twice for seamless scroll -->
        <template v-for="i in 2" :key="i">
          <div
            v-for="(item, idx) in tickerItems"
            :key="`${i}-${idx}`"
            class="ticker__item inline-flex items-center mx-8"
          >
            <span class="text-gold-400 font-bold uppercase tracking-wider mr-2"
              >{{ item.label }}:</span
            >
            <span class="text-white font-mono font-medium">{{
              item.value
            }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Optional As Of Date -->
    <div
      v-if="settings?.ticker?.asOfDate"
      class="absolute right-0 top-0 bottom-0 bg-primary-950/90 backdrop-blur-sm px-4 flex items-center z-10 border-l border-white/10"
    >
      <span
        class="text-[10px] text-slate-400 uppercase tracking-widest whitespace-nowrap"
      >
        As of {{ settings.ticker.asOfDate }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useHomepageStore } from "~/stores/homepage";
import { useBusiness } from "~/composables/useBusiness";
import { formatUSD } from "~/utils/format";

const store = useHomepageStore();
const settings = computed(() => store.settings);
const { jackpot } = useBusiness();

const tickerItems = computed(() => {
  const items = [...(settings.value?.ticker?.items || [])];

  // Optionally append current progressive if available
  if (jackpot.value?.activeLabel && jackpot.value?.currentJackpot) {
    items.push({
      label: jackpot.value.activeLabel,
      value: formatUSD(jackpot.value.currentJackpot),
    });
  }

  return items;
});
</script>

<style scoped>
.ticker-wrap {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.ticker {
  display: inline-block;
  animation: ticker 30s linear infinite;
}

.ticker:hover {
  animation-play-state: paused;
}

@keyframes ticker {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
