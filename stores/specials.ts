import { defineStore } from "pinia";
import { ref } from "vue";

type SpecialDay = {
  day: string;
  title: string;
  description?: string;
  time?: string;
  offers?: string[];
  note?: string;
};

type SpecialsResponse = {
  heroNote?: string;
  weekly?: SpecialDay[];
  today?: SpecialDay | null;
  timezone?: string;
  location?: string;
};

export const useSpecialsStore = defineStore("specials", () => {
  const weekly = ref<SpecialDay[]>([]);
  const today = ref<SpecialDay | null>(null);
  const heroNote = ref("");
  const location = ref("");
  const timezone = ref("");
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchSpecials = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await $fetch<SpecialsResponse>("/api/specials");
      weekly.value = data.weekly ?? [];
      today.value = data.today ?? null;
      heroNote.value = data.heroNote ?? "";
      location.value = data.location ?? "";
      timezone.value = data.timezone ?? "America/Chicago";
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
    // Hydrate specials during SSR so the welcome hero renders with data
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
