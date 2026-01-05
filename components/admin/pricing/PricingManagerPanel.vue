<template>
  <div class="h-full flex flex-col bg-base">
    <!-- Header -->
    <div
      class="px-6 py-4 border-b border-divider bg-surface flex flex-col gap-4 shrink-0"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-primary">Pricing Manager V2</h2>
          <p class="text-xs text-secondary">
            Manage templates, calendar, and promotions.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div
            v-if="store.saving"
            class="text-xs font-bold text-secondary uppercase tracking-wider animate-pulse"
          >
            Saving Draft...
          </div>
          <div
            v-else-if="store.dirty"
            class="text-xs font-bold text-amber-600 uppercase tracking-wider"
          >
            Unsaved Changes
          </div>
          <div
            v-else
            class="text-xs font-bold text-emerald-600 uppercase tracking-wider"
          >
            Draft Saved
          </div>

          <div class="h-6 w-px bg-divider mx-2"></div>

          <button
            class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-divider rounded hover:bg-base transition-colors"
            :disabled="store.saving || !store.dirty"
            @click="handleSaveDraft"
          >
            {{ store.saving ? "Saving..." : "Save Draft" }}
          </button>
          <button
            class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-divider rounded hover:bg-base transition-colors"
            @click="showHistory = true"
          >
            History
          </button>
          <button
            class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-accent-primary text-white rounded hover:bg-accent-primary/90 transition-colors"
            :disabled="store.publishing"
            @click="handlePublish"
          >
            {{ store.publishing ? "Publishing..." : "Publish" }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex space-x-6 border-b border-divider -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'pb-3 px-1 text-sm font-bold border-b-2 transition-colors',
            currentTab === tab.id
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-secondary hover:text-primary hover:border-divider',
          ]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- Main Editor -->
    <div class="flex-1 overflow-hidden p-6 bg-base">
      <div v-if="store.loading" class="flex justify-center py-20">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-primary"
        ></div>
      </div>

      <div v-else-if="store.draftContent" class="h-full">
        <PricingCalendar
          v-if="currentTab === 'calendar'"
          :model-value="store.draftContent"
          @update:model-value="handleUpdate"
        />
        <PricingTemplateList
          v-if="currentTab === 'templates'"
          :model-value="store.draftContent"
          @update:model-value="handleUpdate"
        />
        <PricingPromotionsEditor
          v-if="currentTab === 'promotions'"
          :model-value="store.draftContent"
          @update:model-value="handleUpdate"
        />
      </div>
    </div>

    <!-- History Slide-over -->
    <div
      v-if="showHistory"
      class="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute inset-0 bg-black/50 transition-opacity"
          @click="showHistory = false"
        ></div>
        <div
          class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
        >
          <div class="pointer-events-auto w-screen max-w-md">
            <div
              class="flex h-full flex-col overflow-y-scroll bg-surface shadow-xl"
            >
              <div class="bg-primary-900 px-4 py-6 sm:px-6">
                <div class="flex items-center justify-between">
                  <h2
                    id="slide-over-title"
                    class="text-base font-semibold leading-6 text-white"
                  >
                    Version History
                  </h2>
                  <div class="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      class="relative rounded-md bg-primary-900 text-primary-200 hover:text-white focus:outline-none"
                      @click="showHistory = false"
                    >
                      <span class="absolute -inset-2.5"></span>
                      <span class="sr-only">Close panel</span>
                      <svg
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mt-1">
                  <p class="text-sm text-primary-200">
                    View and restore previous pricing versions.
                  </p>
                </div>
              </div>
              <div class="relative flex-1 px-4 py-6 sm:px-6 bg-base">
                <div v-if="loadingHistory" class="text-center py-8">
                  <div
                    class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary mx-auto"
                  ></div>
                </div>
                <ul v-else role="list" class="space-y-4">
                  <li
                    v-for="version in store.versions"
                    :key="version.id"
                    class="bg-surface border border-divider rounded-lg p-4 hover:border-accent-primary transition-colors"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <span
                          class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                          :class="
                            version.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                              : 'bg-slate-50 text-slate-700 ring-slate-600/20'
                          "
                        >
                          {{ version.status }}
                        </span>
                        <p class="text-xs text-secondary mt-1">
                          {{ new Date(version.created_at).toLocaleString() }}
                        </p>
                      </div>
                      <button
                        v-if="version.status !== 'ACTIVE'"
                        class="text-xs font-bold text-accent-primary hover:text-accent-primary/80"
                        @click="restoreVersion(version)"
                      >
                        Restore
                      </button>
                    </div>
                    <p class="text-xs text-secondary truncate">
                      ID: {{ version.id }}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { usePricingStore } from "~/stores/pricing";
import PricingCalendar from "./PricingCalendar.vue";
import PricingTemplateList from "./PricingTemplateList.vue";
import PricingPromotionsEditor from "./PricingPromotionsEditor.vue";

const store = usePricingStore();
const showHistory = ref(false);
const loadingHistory = ref(false);
const currentTab = ref("calendar");

const tabs = [
  { id: "calendar", name: "Calendar & Rotation" },
  { id: "templates", name: "Templates" },
  { id: "promotions", name: "Promotions" },
];

onMounted(async () => {
  await store.fetchDraft();
  ensureV2Structure();
});

watch(showHistory, async (val) => {
  if (val) {
    loadingHistory.value = true;
    await store.fetchVersions();
    loadingHistory.value = false;
  }
});

function ensureV2Structure() {
  if (!store.draftContent || !store.draftContent.templates) {
    // Initialize V2 structure if missing or legacy
    const initialV2 = {
      templates: [
        {
          id: "default",
          name: "Standard Pricing",
          description: "Default pricing configuration",
          config: store.draftContent || {}, // Use existing content as default config if possible
          isVisible: true,
        },
      ],
      weeklyRotation: {
        Mon: "default",
        Tue: "default",
        Wed: "default",
        Thu: "default",
        Fri: "default",
        Sat: "default",
        Sun: "default",
      },
      dateOverrides: [],
      promotions: [],
      defaultTemplateId: "default",
    };
    store.updateDraftContent(initialV2);
  }
}

function handleUpdate(newContent: any) {
  store.updateDraftContent(newContent);
}

async function handleSaveDraft() {
  await store.saveDraft();
}

async function handlePublish() {
  if (
    confirm(
      "Are you sure you want to publish these changes? This will update the live pricing immediately.",
    )
  ) {
    await store.publish();
  }
}

async function restoreVersion(version: any) {
  if (
    confirm(
      "Are you sure you want to restore this version? Current draft changes will be lost.",
    )
  ) {
    await store.rollback(version.id);
    showHistory.value = false;
    ensureV2Structure();
  }
}
</script>
