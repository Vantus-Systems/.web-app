import { defineStore } from 'pinia';

export const useOpsStore = defineStore('ops', {
  state: () => ({
    pricing: null as any,
    schedule: null as any,
    patterns: [] as any[],
    programs: [] as any[],

    // Drafts for validation/editing
    pricingDraft: null as any,
    scheduleDraft: null as any,

    loading: false,
    dirty: {
      pricing: false,
      schedule: false
    }
  }),

  getters: {
    pricingReady: (state) => !!state.pricing,
    patternsReady: (state) => state.patterns.length > 0,
    programsReady: (state) => state.programs.length > 0,
    hasUnsavedChanges: (state) => state.dirty.pricing || state.dirty.schedule
  },

  actions: {
    async loadAll() {
      this.loading = true;
      try {
        const [pricing, schedule, patterns, programs] = await Promise.all([
          $fetch('/api/pricing', { credentials: 'include' }),
          $fetch('/api/schedule', { credentials: 'include' }),
          $fetch('/api/admin/patterns', { credentials: 'include' }),
          $fetch('/api/admin/programs', { credentials: 'include' })
        ]);

        this.pricing = pricing;
        this.schedule = schedule;
        this.patterns = patterns;
        this.programs = programs;

        // Initialize drafts
        this.resetPricingDraft();
        this.resetScheduleDraft();
      } catch (e) {
        console.error('Failed to load ops data', e);
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
      await $fetch('/api/admin/pricing', {
        method: 'POST',
        body: this.pricingDraft,
        credentials: 'include'
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
      await $fetch('/api/admin/schedule', {
        method: 'POST',
        body: this.scheduleDraft,
        credentials: 'include'
      });
      this.schedule = JSON.parse(JSON.stringify(this.scheduleDraft));
      this.dirty.schedule = false;
    },

    // Patterns
    async savePattern(pattern: any) {
      await $fetch('/api/admin/patterns', {
        method: 'POST',
        body: pattern,
        credentials: 'include'
      });
      await this.refreshPatterns();
    },
    async deletePattern(slug: string) {
      await $fetch(`/api/admin/patterns?slug=${slug}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      await this.refreshPatterns();
    },
    async refreshPatterns() {
      this.patterns = await $fetch('/api/admin/patterns', { credentials: 'include' });
    },

    // Programs
    async saveProgram(program: any) {
      await $fetch('/api/admin/programs', {
        method: 'POST',
        body: program,
        credentials: 'include'
      });
      await this.refreshPrograms();
    },
    async deleteProgram(slug: string) {
      await $fetch(`/api/admin/programs?slug=${slug}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      await this.refreshPrograms();
    },
    async refreshPrograms() {
      this.programs = await $fetch('/api/admin/programs', { credentials: 'include' });
    }
  }
});
