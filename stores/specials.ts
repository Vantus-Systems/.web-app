import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useBusiness } from "~/composables/useBusiness";

type SpecialDay = {
  day: string;
  title: string;
  description?: string;
  time?: string;
  offers?: string[];
  note?: string;
};

// Adapting to use the new `useBusiness` composable
export const useSpecialsStore = defineStore("specials", () => {
  const { specials, fetchSpecials: fetch } = useBusiness();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const weekly = computed(() => specials.value?.weekly ?? []);
  const today = computed(() => specials.value?.today ?? null);
  const heroNote = computed(() => specials.value?.heroNote ?? "");
  const location = computed(() => specials.value?.location ?? "");
  const timezone = computed(() => specials.value?.timezone ?? "America/Chicago");

  const fetchSpecials = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      await fetch();
    } catch (err) {
      console.error("Failed to fetch daily specials:", err);
      error.value = "Unable to load daily specials right now.";
    } finally {
      isLoading.value = false;
    }
  };

  if (import.meta.client) {
    fetchSpecials();
    setInterval(fetchSpecials, 15 * 60 * 1000);
  } else {
    // Ensure SSR data fetch
    fetchSpecials();
  }

  return {
    weekly,
    today,
    heroNote,
    location,
    timezone,
    isLoading,
    error,
    fetchSpecials,
  };
});
