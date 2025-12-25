import { defineStore } from "pinia";
import { ref } from "vue";
import { useBusiness } from "~/composables/useBusiness";

export const useJackpotStore = defineStore("jackpot", () => {
  // Use composable for data to ensure shared state / SSR hydration
  const { jackpot, fetchJackpot: fetch } = useBusiness();

  // We can expose a computed property for the amount or just use the composable directly
  // The existing store exposes `currentJackpot` as a ref number.
  // The new API returns { amount: number, lastUpdated: string } based on `admin/index.vue` handling
  // Let's adapt.

  const currentJackpot = computed(() => {
      // Handle various shapes if migration isn't perfect or if API returns object
      const val = jackpot.value?.amount || jackpot.value?.value || 0;
      return typeof val === 'string' ? parseFloat(val) : val;
  });

  async function fetchJackpot() {
    await fetch();
  }

  // Fetch on init if not already loaded (though composables handle state)
  // `useBusiness` state is global, so this store is just a wrapper now?
  // Ideally, we refactor the app to use `useBusiness().jackpot` directly, but to avoid breaking changes:
  if (import.meta.client) {
      fetchJackpot();
      setInterval(fetchJackpot, 5 * 60 * 1000);
  }

  return {
    currentJackpot,
    fetchJackpot,
  };
});
