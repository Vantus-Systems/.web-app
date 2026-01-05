import { defineStore } from "pinia";
import { useCsrf } from "~/composables/useCsrf";

export const useOpsStore = defineStore("ops", {
  state: () => ({
    patterns: [] as any[],
    programs: [] as any[],
    loading: false,
  }),

  getters: {
    patternsReady: (state) => state.patterns.length > 0,
    programsReady: (state) => state.programs.length > 0,
  },

  actions: {
    async loadAll() {
      this.loading = true;
      try {
        const [patterns, programs] = (await Promise.all([
          $fetch("/api/admin/patterns", { credentials: "include" }),
          $fetch("/api/admin/programs", { credentials: "include" }),
        ])) as any[];

        this.patterns = patterns;
        this.programs = programs;
      } catch (e) {
        console.error("Failed to load ops data", e);
      } finally {
        this.loading = false;
      }
    },

    async refreshPrograms() {
      try {
        this.programs = await $fetch("/api/admin/programs", {
          credentials: "include",
        });
      } catch (e) {
        console.error("Failed to refresh programs", e);
      }
    },

    // Patterns
    async savePattern(pattern: any) {
      const { getHeaders } = useCsrf();
      // Always use POST for upsert behavior
      const result = await $fetch("/api/admin/patterns", {
        method: "POST",
        body: pattern,
        headers: getHeaders(),
        credentials: "include",
      });

      // Refresh patterns
      this.patterns = await $fetch("/api/admin/patterns", {
        credentials: "include",
      });
      return result;
    },

    async deletePattern(slug: string) {
      const { getHeaders } = useCsrf();
      const result = await $fetch(`/api/admin/patterns?slug=${slug}`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include",
      });

      // Refresh patterns
      this.patterns = await $fetch("/api/admin/patterns", {
        credentials: "include",
      });
      return result;
    },

    // Programs
    async saveProgram(program: any) {
      const { getHeaders } = useCsrf();
      // Always use POST for upsert behavior
      const result = await $fetch<any>("/api/admin/programs", {
        method: "POST",
        body: program,
        headers: getHeaders(),
        credentials: "include",
      });

      // Refresh programs
      await this.refreshPrograms();
      return result;
    },

    async deleteProgram(slug: string) {
      const { getHeaders } = useCsrf();
      const result = await $fetch<any>(`/api/admin/programs?slug=${slug}`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include",
      });

      // Refresh programs
      await this.refreshPrograms();
      return result;
    },
  },
});
