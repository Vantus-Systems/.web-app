import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useBusiness } from "~/composables/useBusiness";

export const useJackpotStore = defineStore("jackpot", () => {
  const { jackpot, fetchJackpot: fetch } = useBusiness();
  const cycleIndex = ref(0);

  // Start cycling on client side
  if (import.meta.client) {
    setInterval(() => {
      if (jackpot.value && Array.isArray((jackpot.value as any).items)) {
        const items = (jackpot.value as any).items;
        if (items.length > 0) {
          cycleIndex.value = (cycleIndex.value + 1) % items.length;
        }
      }
    }, 5000);

    // Also periodic fetch
    setInterval(fetch, 5 * 60 * 1000);
  }

  // Initial fetch
  fetch();

  const items = computed(() => {
    if (!jackpot.value) return [];
    if (Array.isArray((jackpot.value as any).items)) {
      return (jackpot.value as any).items;
    }
    // Fallback if data hasn't migrated in store state yet (though API should handle it)
    return [];
  });

  // Expose individual progressive values (Backward Compatibility)
  const babesValue = computed(() => {
    const item = items.value.find((i: any) =>
      i.label?.toLowerCase().includes("babes"),
    );
    return item ? item.current : 0;
  });

  const hornetValue = computed(() => {
    const item = items.value.find((i: any) =>
      i.label?.toLowerCase().includes("hornet"),
    );
    return item ? item.current : 0;
  });

  const activeKey = computed(() => {
    // Determine which item to show based on logic or cycling
    if (items.value.length === 0) return "legacy";

    // "Time of day" logic - attempt to preserve "Daytime" vs "Night" if possible
    // Default to cycling
    return cycleIndex.value;
  });

  const currentJackpot = computed(() => {
    if (items.value.length === 0) return 0;
    const index =
      activeKey.value === "legacy" ? 0 : (activeKey.value as number);
    return items.value[index]?.current ?? 0;
  });

  const activeLabel = computed(() => {
    if (items.value.length === 0) return "Shamrock Progressive Jackpot";
    const index =
      activeKey.value === "legacy" ? 0 : (activeKey.value as number);
    return items.value[index]?.label || "Progressive Jackpot";
  });

  return {
    currentJackpot,
    activeLabel,
    babesValue,
    hornetValue,
    fetchJackpot: fetch,
  };
});
