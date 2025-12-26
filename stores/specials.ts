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

type SpecialsData = {
  heroNote?: string;
  weekly?: SpecialDay[];
  today?: SpecialDay | null;
  timezone?: string;
  location?: string;
  meta?: {
    timezone?: string;
    location?: string;
  };
};

export const useSpecialsStore = defineStore("specials", () => {
  const { specials, fetchSpecials: fetch } = useBusiness();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const weekly = computed(() => (specials.value as SpecialsData)?.weekly ?? []);
  const today = computed(() => (specials.value as SpecialsData)?.today ?? null);
  const heroNote = computed(
    () => (specials.value as SpecialsData)?.heroNote ?? "",
  );
  const location = computed(() => {
    const s = specials.value as SpecialsData;
    return s?.meta?.location ?? s?.location ?? "";
  });
  const timezone = computed(() => {
    const s = specials.value as SpecialsData;
    return s?.meta?.timezone ?? s?.timezone ?? "America/Chicago";
  });

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
