import { defineStore } from "pinia";
import { useCsrf } from "~/composables/useCsrf";

export interface PricingVersion {
  id: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  created_at: string;
  created_by: string;
  published_at?: string;
  published_by?: string;
  content: string; // JSON string
}

export const usePricingStore = defineStore("pricing", {
  state: () => ({
    versions: [] as PricingVersion[],
    draft: null as PricingVersion | null,
    draftContent: null as any,
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
        const response = await $fetch<PricingVersion[]>(
          "/api/admin/pricing/versions",
          {
            credentials: "include",
          },
        );
        this.versions = response;
      } catch (e) {
        console.error("Failed to fetch pricing versions", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchDraft() {
      this.loading = true;
      try {
        const response = await $fetch<PricingVersion>(
          "/api/admin/pricing/draft",
          {
            credentials: "include",
          },
        );
        this.draft = response;
        try {
          const parsed =
            typeof response.content === "string"
              ? JSON.parse(response.content)
              : response.content;
          // If empty object, treat as null so editor uses default
          this.draftContent =
            parsed && Object.keys(parsed).length > 0 ? parsed : null;
        } catch {
          this.draftContent = null;
        }
        this.dirty = false;
      } catch (e) {
        console.error("Failed to fetch pricing draft", e);
      } finally {
        this.loading = false;
      }
    },

    async saveDraft(content?: any) {
      this.saving = true;
      const { getHeaders } = useCsrf();
      const payload = content || this.draftContent;
      try {
        await $fetch("/api/admin/pricing/draft", {
          method: "POST",
          body: { content: payload },
          headers: getHeaders(),
          credentials: "include",
        });
        // Do not re-fetch draft to avoid overwriting ongoing edits with potentially stale server state
        // await this.fetchDraft();
        this.dirty = false;
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message };
      } finally {
        this.saving = false;
      }
    },

    async publish() {
      this.publishing = true;
      const { getHeaders } = useCsrf();
      try {
        await $fetch("/api/admin/pricing/publish", {
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
        await $fetch("/api/admin/pricing/rollback", {
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

    updateDraftContent(content: any) {
      this.draftContent = content;
      this.dirty = true;
    },
  },
});
