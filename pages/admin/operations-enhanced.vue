<template>
  <div class="h-screen bg-base overflow-hidden">
    <div class="h-full flex flex-col">
      <!-- Header -->
      <header
        class="bg-surface border-b border-divider px-6 py-4 flex items-center justify-between"
      >
        <div>
          <h1 class="text-xl font-bold text-primary">Operations Studio</h1>
          <p class="text-sm text-secondary">Pricing & Timeline Builder</p>
        </div>
        <div class="flex items-center gap-3">
          <BaseButtonEnhanced
            variant="secondary"
            size="small"
            label="Save Draft"
            @click="saveDraft"
          />
          <BaseButtonEnhanced
            variant="primary"
            size="small"
            label="Publish"
            @click="publishSchema"
          />
        </div>
      </header>

      <!-- Main Editor -->
      <div class="flex-1 min-h-0">
        <OpsSchemaPricingEditorEnhanced
          v-if="schema"
          v-model="schema"
          :density="density"
          @update:density="density = $event"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-surface rounded-lg p-6 shadow-xl">
        <div class="flex items-center gap-3">
          <div
            class="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-primary font-semibold">Loading schema...</span>
        </div>
      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="error"
      class="fixed bottom-6 right-6 px-4 py-3 bg-accent-error text-white rounded-lg shadow-lg z-50 flex items-center gap-2"
    >
      <span>⚠</span>
      <span>{{ error }}</span>
      <button class="ml-2 text-white/80 hover:text-white" @click="error = ''">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { OpsSchemaV2 } from "~/types/ops-schema";
import { useOpsStore } from "~/stores/ops";

// Components
import BaseButtonEnhanced from "~/components/ui/BaseButtonEnhanced.vue";
import OpsSchemaPricingEditorEnhanced from "~/components/admin/ops/OpsSchemaPricingEditorEnhanced.vue";

// State
const schema = ref<OpsSchemaV2 | null>(null);
const loading = ref(true);
const error = ref("");
const density = ref<"compact" | "standard" | "detail">("standard");

// Store
const opsStore = useOpsStore();

// Load schema
onMounted(async () => {
  try {
    await opsStore.loadSchema();

    // Use existing schema or create default
    if (opsStore.draftSchema) {
      schema.value = opsStore.draftSchema;
    } else {
      // Create a default schema
      schema.value = {
        id: `ops-${Date.now()}`,
        version: 2,
        definitions: {
          rateCards: [
            {
              id: "rate-standard",
              name: "Standard Rate",
              category: "Standard",
              color: "#3b82f6",
              yield_configuration: {
                mode: "standard_rate",
                active_bundles: [],
              },
            },
            {
              id: "rate-vip",
              name: "VIP Rate",
              category: "Premium",
              color: "#8b5cf6",
              yield_configuration: {
                mode: "fixed_rate",
                active_bundles: [],
              },
            },
          ],
          dayProfiles: [],
        },
        timeline: {
          operationalHours: {
            isOpen: true,
            start: "09:00",
            end: "23:00",
          },
          flowSegments: [],
          overlayEvents: [],
        },
        logicTriggers: [],
        calendar: {
          assignments: [],
          overrides: [],
        },
      };
    }
  } catch (err) {
    error.value = "Failed to load schema: " + (err as Error).message;
  } finally {
    loading.value = false;
  }
});

// Actions
const saveDraft = async () => {
  if (!schema.value) return;

  try {
    await opsStore.saveDraft(schema.value);
    error.value = "Draft saved successfully!";
    setTimeout(() => (error.value = ""), 2000);
  } catch (err) {
    error.value = "Failed to save: " + (err as Error).message;
  }
};

const publishSchema = async () => {
  if (!schema.value) return;

  if (
    !confirm(
      "Are you sure you want to publish this schema? This will make it live.",
    )
  ) {
    return;
  }

  try {
    await opsStore.publishSchema();
    error.value = "Published successfully!";
    setTimeout(() => (error.value = ""), 2000);
  } catch (err) {
    error.value = "Failed to publish: " + (err as Error).message;
  }
};
</script>

<style>
/* Ensure full height */
html,
body {
  height: 100%;
}

/* Remove default margins */
body {
  margin: 0;
}

/* Custom scrollbar for premium feel */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
