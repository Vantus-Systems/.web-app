import { defineStore } from "pinia";
import { ref } from "vue";

export const useJackpotStore = defineStore("jackpot", () => {
  const currentJackpot = ref(2500);

  async function fetchJackpot() {
    try {
      const data = await $fetch("/api/jackpot");
      if (data && typeof data.value === "number") {
        currentJackpot.value = data.value;
      }
    } catch (e) {
      console.error("Failed to fetch jackpot:", e);
      // Fallback is already set
    }
  }

  // Fetch on init
  if (import.meta.client) {
    fetchJackpot();
    // Refresh occasionally (e.g., every 5 minutes), not every second
    setInterval(fetchJackpot, 5 * 60 * 1000);
  }

  return {
    currentJackpot,
    fetchJackpot,
  };
});
