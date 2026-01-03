import { defineStore } from "pinia";
import { useCsrf } from "~/composables/useCsrf";
import type { OpsSchemaV2 } from "~/types/ops-schema";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const currentYearRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const normalizeOpsSchema = (schema: any): OpsSchemaV2 | null => {
  if (!schema) return null;
  if (schema.definitions?.rateCards) {
    return schema as OpsSchemaV2;
  }

  const range = currentYearRange();
  const weekdayDefaults = weekDays.reduce(
    (acc, day) => {
      const profileId = schema.calendar?.assignments?.[day];
      acc[day] = profileId
        ? ({ status: "open", profile_id: profileId } as const)
        : { status: "closed" as const };
      return acc;
    },
    {} as Record<
      string,
      { status: "closed" } | { status: "open"; profile_id: string }
    >,
  );

  const inventoryTiers = Object.values(
    schema.definitions?.inventory_tiers ?? {},
  );
  const bundles = Object.values(schema.definitions?.bundles ?? {});
  const rateCards = Object.values(schema.definitions?.rate_cards ?? {});

  return {
    schema_version: schema.schema_version ?? "v2",
    meta: {
      name: schema.meta?.profile_name ?? "Operations Schema",
      status: schema.meta?.status === "active" ? "live" : "draft",
      currency: schema.meta?.currency ?? "USD",
      timezone: schema.meta?.timezone ?? "America/Los_Angeles",
      schema_version: schema.schema_version ?? "v2",
    },
    definitions: {
      inventoryTiers: inventoryTiers as any[],
      bundles: bundles as any[],
      rateCards: rateCards as any[],
    },
    timeline: {
      operationalHours: {
        start: "09:00",
        end: "03:00",
        isOpen: true,
      },
      flowSegments: schema.timeline_configuration?.flow_segments ?? [],
      overlayEvents: schema.timeline_configuration?.overlay_events ?? [],
    },
    logicTriggers: (schema.logic_triggers ?? []).map(
      (trigger: any, index: number) => ({
        id: trigger.id ?? `trigger-${index}`,
        ...trigger,
      }),
    ),
    dayProfiles: schema.day_profiles ?? [],
    calendar: {
      range,
      weekdayDefaults,
      assignments: {},
      overrides: schema.calendar?.overrides ?? {},
    },
  };
};

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
        ] = (await Promise.all([
          $fetch("/api/pricing", { credentials: "include" }),
          $fetch("/api/schedule", { credentials: "include" }),
          $fetch("/api/admin/patterns", { credentials: "include" }),
          $fetch("/api/admin/programs", { credentials: "include" }),
          $fetch("/api/admin/ops-schema", { credentials: "include" }),
          $fetch("/api/admin/schedule-day-profiles", {
            credentials: "include",
          }),
        ])) as any[];

        this.pricing = pricing;
        this.schedule = schedule;
        this.patterns = patterns;
        this.programs = programs;
        this.opsSchemaDraft = normalizeOpsSchema(opsSchemaResponse?.draft);
        this.opsSchemaLive = normalizeOpsSchema(opsSchemaResponse?.live);
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
      const { getHeaders } = useCsrf();
      await $fetch("/api/admin/pricing", {
        method: "POST",
        body: this.pricingDraft,
        headers: getHeaders(),
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
      const { getHeaders } = useCsrf();
      await $fetch("/api/admin/schedule", {
        method: "POST",
        body: this.scheduleDraft,
        headers: getHeaders(),
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
      const range = currentYearRange();
      const weekdayDefaults = weekDays.reduce(
        (acc, day) => {
          acc[day] = { status: "closed" as const };
          return acc;
        },
        {} as Record<string, { status: "closed" }>,
      );
      this.opsSchemaDraft = {
        schema_version: "v2",
        meta: {
          name: "Operations Schema",
          status: "draft",
          currency: "USD",
          timezone: "America/Los_Angeles",
          schema_version: "v2",
        },
        definitions: {
          inventoryTiers: [],
          bundles: [],
          rateCards: [],
        },
        timeline: {
          operationalHours: {
            start: "09:00",
            end: "03:00",
            isOpen: true,
          },
          flowSegments: [],
          overlayEvents: [],
        },
        logicTriggers: [],
        dayProfiles: [],
        calendar: {
          range,
          weekdayDefaults,
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
      const { getHeaders } = useCsrf();
      await $fetch("/api/admin/ops-schema", {
        method: "POST",
        body: this.opsSchemaDraft,
        headers: getHeaders(),
        credentials: "include",
      });
      this.opsSchemaDraft = JSON.parse(JSON.stringify(this.opsSchemaDraft));
      this.dirty.opsSchema = false;
    },
    async publishOpsSchema() {
      const { getHeaders } = useCsrf();
      await $fetch("/api/admin/ops-schema/publish", {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });
      await this.refreshOpsSchema();
    },
    async rollbackOpsSchema() {
      const { getHeaders } = useCsrf();
      await $fetch("/api/admin/ops-schema/rollback", {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });
      await this.refreshOpsSchema();
    },
    async refreshOpsSchema() {
      const response = await $fetch("/api/admin/ops-schema", {
        credentials: "include",
      });
      this.opsSchemaDraft = normalizeOpsSchema(response?.draft);
      this.opsSchemaLive = normalizeOpsSchema(response?.live);
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
      const { getHeaders } = useCsrf();
      await $fetch("/api/admin/schedule-day-profiles", {
        method: "POST",
        body: this.scheduleDayProfilesDraft,
        headers: getHeaders(),
        credentials: "include",
      });
      this.scheduleDayProfiles = JSON.parse(
        JSON.stringify(this.scheduleDayProfilesDraft),
      );
      this.dirty.scheduleDayProfiles = false;
    },

    // Patterns
    async savePattern(pattern: any) {
      const { getHeaders } = useCsrf();
      await $fetch("/api/admin/patterns", {
        method: "POST",
        body: pattern,
        headers: getHeaders(),
        credentials: "include",
      });
      await this.refreshPatterns();
    },
    async deletePattern(slug: string) {
      const { getHeaders } = useCsrf();
      await $fetch(`/api/admin/patterns?slug=${slug}`, {
        method: "DELETE",
        headers: getHeaders(),
        credentials: "include",
      });
      await this.refreshPatterns();
    },
    async refreshPatterns() {
      this.patterns = await $fetch<any>("/api/admin/patterns", {
        credentials: "include",
      });
    },

    // Programs
    async saveProgram(program: any) {
      const { getHeaders } = useCsrf();
      try {
        const response = await $fetch("/api/admin/programs", {
          method: "POST",
          body: program,
          headers: getHeaders(),
          credentials: "include",
        });
        await this.refreshPrograms();
        return { success: true, data: response };
      } catch (error: any) {
        const validationErrors = error?.data?.errors || [];
        return {
          success: false,
          error: error?.message || "Failed to save program",
          validationErrors,
        };
      }
    },
    async deleteProgram(slug: string) {
      const { getHeaders } = useCsrf();
      try {
        const response = await $fetch(`/api/admin/programs?slug=${slug}`, {
          method: "DELETE",
          headers: getHeaders(),
          credentials: "include",
        });
        await this.refreshPrograms();
        return { success: true, data: response };
      } catch (error: any) {
        return {
          success: false,
          error: error?.message || "Failed to delete program",
        };
      }
    },
    async refreshPrograms() {
      this.programs = await $fetch<any>("/api/admin/programs", {
        credentials: "include",
      });
    },
  },
});
