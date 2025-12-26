import { defineStore } from "pinia";
import { computed, ref, onMounted } from "vue";
import { useBusiness } from "~/composables/useBusiness";

export const useJackpotStore = defineStore("jackpot", () => {
  const { jackpot, fetchJackpot: fetch } = useBusiness();
  const cycleState = ref<'babes' | 'hornet'>('babes');

  // Timer for cycling display (outside active hours)
  // We can't rely on lifecycle hooks like onMounted in a store setup function directly for cleanup,
  // but we can start the interval.
  let intervalId: any;

  // Start cycling on client side
  if (import.meta.client) {
    intervalId = setInterval(() => {
      cycleState.value = cycleState.value === 'babes' ? 'hornet' : 'babes';
    }, 5000);

    // Also periodic fetch
    setInterval(fetch, 5 * 60 * 1000);
  }

  // Initial fetch
  fetch();

  // Expose individual progressive values
  const babesValue = computed(() => {
      if (!jackpot.value || !('babes' in jackpot.value)) return 0;
      return (jackpot.value as any).babes.current ?? 0;
  });

  const hornetValue = computed(() => {
      if (!jackpot.value || !('hornet' in jackpot.value)) {
           // Fallback for legacy if needed, or just 0
           return 0;
      }
      return (jackpot.value as any).hornet.current ?? 0;
  });

  const activeKey = computed(() => {
      // Default fallback
      if (!jackpot.value || !('babes' in jackpot.value)) return 'legacy';

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const startDay = 10 * 60;       // 10:00 AM
      const endDay = 16 * 60 + 20;    // 4:20 PM
      const endNight = 21 * 60 + 30;  // 9:30 PM

      // "show the daytime progressive until around 4:20 PM"
      // "switch to the night time progressive until around 9:30 pm"
      // "cycle between the two" (implied: otherwise)

      if (totalMinutes >= startDay && totalMinutes < endDay) {
          return 'babes';
      } else if (totalMinutes >= endDay && totalMinutes < endNight) {
          return 'hornet';
      } else {
          return cycleState.value;
      }
  });

  const currentJackpot = computed(() => {
    if (activeKey.value === 'legacy') {
         const val = (jackpot.value as any)?.value ?? 0;
         return typeof val === 'string' ? parseFloat(val) : val;
    }
    return activeKey.value === 'babes' ? babesValue.value : hornetValue.value;
  });

  const activeLabel = computed(() => {
      if (activeKey.value === 'legacy') return "Shamrock Progressive Jackpot";

      if (activeKey.value === 'babes') {
          return (jackpot.value as any)?.babes?.label || "Bingo Babes Progressive";
      } else {
          return (jackpot.value as any)?.hornet?.label || "Progressive Hornet";
      }
  });

  return {
    currentJackpot,
    activeLabel,
    babesValue,
    hornetValue,
    fetchJackpot: fetch,
  };
});
