import { defineStore } from "pinia";
import type { HomepageSettings } from "~/server/schemas/homepage";

export const useHomepageStore = defineStore("homepage", {
  state: () => ({
    settings: null as HomepageSettings | null,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetch() {
      if (this.settings) return; // Already loaded

      this.isLoading = true;
      try {
        const { data } = await useFetch<HomepageSettings>("/api/homepage");
        if (data.value) {
          this.settings = data.value;
        }
      } catch (err: any) {
        this.error = err.message || "Failed to load homepage settings";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
