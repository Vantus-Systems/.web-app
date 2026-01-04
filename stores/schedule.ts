import { defineStore } from "pinia";
import { useCsrf } from "~/composables/useCsrf";
import type { ScheduleVersion, WeeklyScheduleSlot } from "~/types/schedule";

export const useScheduleStore = defineStore("schedule", {
  state: () => ({
    versions: [] as ScheduleVersion[],
    draft: null as ScheduleVersion | null,
    loading: false,
    saving: false,
    publishing: false,
    rollingBack: false,
    dirty: false,
  }),

  getters: {
    hasUnsavedChanges: (state) => state.dirty,
    activeVersion: (state) => state.versions.find((v) => v.status === "ACTIVE"),
  },

  actions: {
    async fetchVersions() {
      this.loading = true;
      try {
        const response = await $fetch<ScheduleVersion[]>(
          "/api/admin/schedule/versions",
          {
            credentials: "include",
          },
        );
        this.versions = response;
      } catch (e) {
        console.error("Failed to fetch schedule versions", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchDraft() {
      this.loading = true;
      try {
        const response = await $fetch<ScheduleVersion>(
          "/api/admin/schedule/draft",
          {
            credentials: "include",
          },
        );
        this.draft = response;
        this.dirty = false;
      } catch (e) {
        console.error("Failed to fetch schedule draft", e);
      } finally {
        this.loading = false;
      }
    },

    /* eslint-disable camelcase */
    async saveDraft(slots: WeeklyScheduleSlot[], week_start?: string) {
      if (!this.draft) return;
      this.saving = true;
      const { getHeaders } = useCsrf();
      try {
        await $fetch("/api/admin/schedule/draft", {
          method: "POST",
          body: { slots, week_start },
          headers: getHeaders(),
          credentials: "include",
        });
        await this.fetchDraft(); // Reload to get fresh state
        this.dirty = false;
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message };
      } finally {
        this.saving = false;
      }
    },
    /* eslint-enable camelcase */

    async publish() {
      this.publishing = true;
      const { getHeaders } = useCsrf();
      try {
        await $fetch("/api/admin/schedule/publish", {
          method: "POST",
          headers: getHeaders(),
          credentials: "include",
        });
        await this.fetchVersions();
        await this.fetchDraft();
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message };
      } finally {
        this.publishing = false;
      }
    },

    async rollback(versionId: string) {
      this.rollingBack = true;
      const { getHeaders } = useCsrf();
      try {
        await $fetch("/api/admin/schedule/rollback", {
          method: "POST",
          body: { versionId },
          headers: getHeaders(),
          credentials: "include",
        });
        await this.fetchVersions();
        await this.fetchDraft();
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message };
      } finally {
        this.rollingBack = false;
      }
    },

    updateDraftLocal(slots: WeeklyScheduleSlot[]) {
      if (this.draft) {
        this.draft.slots = slots;
        this.dirty = true;
      }
    },
  },
});
