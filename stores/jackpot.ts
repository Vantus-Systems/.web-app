import { defineStore } from "pinia";
import { computed } from "vue";
import { useBusiness } from "~/composables/useBusiness";

export const useJackpotStore = defineStore("jackpot", () => {
  const { jackpot, fetchJackpot: fetch } = useBusiness();

  const currentJackpot = computed(() => {
    // Determine whether to show Babes (Daytime) or Hornet (Session)
    // Babes is played at 4 PM.
    // Logic: If current time is between 10 AM and 4:30 PM, show Babes.
    // Else show Hornet.

    // Default to Hornet if structure is missing (or legacy)
    if (!jackpot.value || !('babes' in jackpot.value)) {
        // Legacy fallback
        const val = (jackpot.value as any)?.value ?? 0;
        return typeof val === 'string' ? parseFloat(val) : val;
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // 10:00 to 16:30 (4:30 PM) -> Babes
    const isDaytime = (hours > 10 || (hours === 10 && minutes >= 0)) &&
                      (hours < 16 || (hours === 16 && minutes <= 30));

    const activeProgressive = isDaytime ? (jackpot.value as any).babes : (jackpot.value as any).hornet;

    return activeProgressive?.current ?? 0;
  });

  const activeLabel = computed(() => {
      if (!jackpot.value || !('babes' in jackpot.value)) return "Shamrock Progressive Jackpot";

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isDaytime = (hours > 10 || (hours === 10 && minutes >= 0)) &&
                        (hours < 16 || (hours === 16 && minutes <= 30));

      const activeProgressive = isDaytime ? (jackpot.value as any).babes : (jackpot.value as any).hornet;
      return activeProgressive?.label || (isDaytime ? "Bingo Babes Progressive" : "Progressive Hornet");
  });

  async function fetchJackpot() {
    await fetch();
  }

  fetchJackpot();

  if (import.meta.client) {
    setInterval(fetchJackpot, 5 * 60 * 1000);
  }

  return {
    currentJackpot,
    activeLabel,
    fetchJackpot,
  };
});
