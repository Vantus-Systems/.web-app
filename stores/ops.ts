import { defineStore } from "pinia";

export const useOpsStore = defineStore("ops", {
  state: () => ({
    pricing: null as any,
    schedule: null as any,
    patterns: [] as any[],
    programs: [] as any[],
    opsSchemaDraft: null as any,
    opsSchemaLive: null as any,
    opsSchemaHistoryMeta: [] as any[],
    scheduleDayProfiles: null as any,
    derivedPricingPreview: null as any,
    derivedSchedulePreview: null as any,

    // Drafts for validation/editing
    pricingDraft: null as any,
    scheduleDraft: null as any,
    scheduleDayProfilesDraft: null as any,

    loading: false,
    dirty: {
      pricing: false,
      schedule: false,
      opsSchema: false,
      scheduleDayProfiles: false,
    },
  }),

  getters: {
    pricingReady: (state) => !!state.pricing,
    patternsReady: (state) => state.patterns.length > 0,
    programsReady: (state) => state.programs.length > 0,
    hasUnsavedChanges: (state) =>
      state.dirty.pricing ||
      state.dirty.schedule ||
      state.dirty.opsSchema ||
      state.dirty.scheduleDayProfiles,
  },

  actions: {
    async loadAll() {
      this.loading = true;
      try {
        const [
          pricing,
          schedule,
          patterns,
          programs,
          opsSchemaResponse,
          scheduleDayProfiles,
        ] = await Promise.all([
          $fetch("/api/pricing", { credentials: "include" }),
          $fetch("/api/schedule", { credentials: "include" }),
          $fetch("/api/admin/patterns", { credentials: "include" }),
          $fetch("/api/admin/programs", { credentials: "include" }),
          $fetch("/api/admin/ops-schema", { credentials: "include" }),
          $fetch("/api/admin/schedule-day-profiles", {
            credentials: "include",
          }),
        ]);

        this.pricing = pricing;
        this.schedule = schedule;
        this.patterns = patterns;
        this.programs = programs;
        this.opsSchemaDraft = opsSchemaResponse?.draft ?? null;
        this.opsSchemaLive = opsSchemaResponse?.live ?? null;
        this.opsSchemaHistoryMeta = opsSchemaResponse?.historyMeta ?? [];
        this.scheduleDayProfiles = scheduleDayProfiles;
        this.derivedPricingPreview = pricing;
        this.derivedSchedulePreview = schedule;

        // Initialize drafts
        this.resetPricingDraft();
        this.resetScheduleDraft();
        this.resetOpsSchemaDraft();
        this.resetScheduleDayProfilesDraft();
      } catch (e) {
        console.error("Failed to load ops data", e);
      } finally {
        this.loading = false;
      }
    },

    // Pricing
    resetPricingDraft() {
      if (this.pricing) {
        this.pricingDraft = JSON.parse(JSON.stringify(this.pricing));
        this.dirty.pricing = false;
      }
    },
    updatePricingDraft(val: any) {
      this.pricingDraft = val;
      this.dirty.pricing = true;
    },
    async savePricing() {
      if (!this.pricingDraft) return;
      await $fetch("/api/admin/pricing", {
        method: "POST",
        body: this.pricingDraft,
        credentials: "include",
      });
      this.pricing = JSON.parse(JSON.stringify(this.pricingDraft));
      this.dirty.pricing = false;
    },

    // Schedule
    resetScheduleDraft() {
      if (this.schedule) {
        this.scheduleDraft = JSON.parse(JSON.stringify(this.schedule));
        this.dirty.schedule = false;
      }
    },
    updateScheduleDraft(val: any) {
      this.scheduleDraft = val;
      this.dirty.schedule = true;
    },
    async saveSchedule() {
      if (!this.scheduleDraft) return;
      await $fetch("/api/admin/schedule", {
        method: "POST",
        body: this.scheduleDraft,
        credentials: "include",
      });
      this.schedule = JSON.parse(JSON.stringify(this.scheduleDraft));
      this.dirty.schedule = false;
    },

    // Ops Schema
    resetOpsSchemaDraft() {
      if (this.opsSchemaDraft) {
        this.opsSchemaDraft = JSON.parse(JSON.stringify(this.opsSchemaDraft));
        this.dirty.opsSchema = false;
        return;
      }
      if (this.opsSchemaLive) {
        this.opsSchemaDraft = JSON.parse(JSON.stringify(this.opsSchemaLive));
        this.dirty.opsSchema = false;
        return;
      }
      this.opsSchemaDraft = {
        schema_version: "v2",
        meta: {
          profile_name: "Default Ops Schema",
          status: "draft",
          currency: "USD",
          timezone: "America/Los_Angeles",
        },
        definitions: {
          inventory_tiers: {},
          bundles: {},
          rate_cards: {},
        },
        timeline_configuration: {
          flow_segments: [],
          overlay_events: [],
        },
        logic_triggers: [],
        day_profiles: [],
        calendar: {
          assignments: {},
          overrides: {},
        },
      };
      this.dirty.opsSchema = false;
    },
    updateOpsSchemaDraft(val: any) {
      this.opsSchemaDraft = val;
      this.dirty.opsSchema = true;
    },
    async saveOpsSchema() {
      if (!this.opsSchemaDraft) return;
      await $fetch("/api/admin/ops-schema", {
        method: "POST",
        body: this.opsSchemaDraft,
        credentials: "include",
      });
      this.opsSchemaDraft = JSON.parse(JSON.stringify(this.opsSchemaDraft));
      this.dirty.opsSchema = false;
    },
    async publishOpsSchema() {
      await $fetch("/api/admin/ops-schema/publish", {
        method: "POST",
        credentials: "include",
      });
      await this.refreshOpsSchema();
    },
    async rollbackOpsSchema() {
      await $fetch("/api/admin/ops-schema/rollback", {
        method: "POST",
        credentials: "include",
      });
      await this.refreshOpsSchema();
    },
    async refreshOpsSchema() {
      const response = await $fetch("/api/admin/ops-schema", {
        credentials: "include",
      });
      this.opsSchemaDraft = response?.draft ?? null;
      this.opsSchemaLive = response?.live ?? null;
      this.opsSchemaHistoryMeta = response?.historyMeta ?? [];
      this.dirty.opsSchema = false;
    },

    // Schedule Day Profiles
    resetScheduleDayProfilesDraft() {
      if (this.scheduleDayProfiles) {
        this.scheduleDayProfilesDraft = JSON.parse(
          JSON.stringify(this.scheduleDayProfiles),
        );
        this.dirty.scheduleDayProfiles = false;
        return;
      }
      this.scheduleDayProfilesDraft = {
        profiles: [],
        assignments: {},
        overrides: {},
      };
      this.dirty.scheduleDayProfiles = false;
    },
    updateScheduleDayProfilesDraft(val: any) {
      this.scheduleDayProfilesDraft = val;
      this.dirty.scheduleDayProfiles = true;
    },
    async saveScheduleDayProfiles() {
      if (!this.scheduleDayProfilesDraft) return;
      await $fetch("/api/admin/schedule-day-profiles", {
        method: "POST",
        body: this.scheduleDayProfilesDraft,
        credentials: "include",
      });
      this.scheduleDayProfiles = JSON.parse(
        JSON.stringify(this.scheduleDayProfilesDraft),
      );
      this.dirty.scheduleDayProfiles = false;
    },

    // Patterns
    async savePattern(pattern: any) {
      await $fetch("/api/admin/patterns", {
        method: "POST",
        body: pattern,
        credentials: "include",
      });
      await this.refreshPatterns();
    },
    async deletePattern(slug: string) {
      await $fetch(`/api/admin/patterns?slug=${slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      await this.refreshPatterns();
    },
    async refreshPatterns() {
      this.patterns = await $fetch("/api/admin/patterns", {
        credentials: "include",
      });
    },

    // Programs
    async saveProgram(program: any) {
      await $fetch("/api/admin/programs", {
        method: "POST",
        body: program,
        credentials: "include",
      });
      await this.refreshPrograms();
    },
    async deleteProgram(slug: string) {
      await $fetch(`/api/admin/programs?slug=${slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      await this.refreshPrograms();
    },
    async refreshPrograms() {
      this.programs = await $fetch("/api/admin/programs", {
        credentials: "include",
      });
    },
  },
});
