<template>
  <div class="space-y-4">
    <h4 class="text-sm font-semibold text-primary">Stage Preview</h4>

    <!-- Current Time -->
    <div class="bg-base border border-divider rounded-lg p-3">
      <div class="text-xs text-secondary mb-1">Current Time</div>
      <div class="text-xl font-mono font-bold text-primary">{{ preview.time }}</div>
    </div>

    <!-- Customer Screen -->
    <div class="bg-base border border-divider rounded-lg p-3">
      <div class="text-xs text-secondary mb-2">Customer Screen</div>
      <div class="text-sm font-semibold text-primary">{{ preview.customerScreen }}</div>
    </div>

    <!-- POS/Staff -->
    <div class="bg-base border border-divider rounded-lg p-3">
      <div class="text-xs text-secondary mb-2">POS / Staff</div>
      <div class="text-sm text-primary">{{ preview.posStaff }}</div>
    </div>

    <!-- Active Flow -->
    <div class="bg-base border border-divider rounded-lg p-3">
      <div class="text-xs text-secondary mb-2">Active Flow</div>
      <div class="text-sm font-medium text-primary">{{ preview.activeFlow }}</div>
    </div>

    <!-- Active Overlays -->
    <div class="bg-base border border-divider rounded-lg p-3">
      <div class="text-xs text-secondary mb-2">Active Overlays</div>
      <div v-if="preview.activeOverlays.length === 0" class="text-sm text-tertiary">
        None
      </div>
      <ul v-else class="text-sm space-y-1">
        <li
          v-for="(overlay, idx) in preview.activeOverlays"
          :key="idx"
          class="text-primary flex items-center gap-2"
        >
          <span class="w-2 h-2 bg-accent-info rounded-full"></span>
          {{ overlay }}
        </li>
      </ul>
    </div>

    <!-- Triggered Events -->
    <div class="bg-base border border-divider rounded-lg p-3">
      <div class="text-xs text-secondary mb-2">Triggered Events</div>
      <div v-if="preview.triggeredEvents.length === 0" class="text-sm text-tertiary">
        None
      </div>
      <ul v-else class="text-xs space-y-1 font-mono">
        <li
          v-for="(event, idx) in preview.triggeredEvents"
          :key="idx"
          class="text-accent-error"
        >
          {{ event }}
        </li>
      </ul>
    </div>

    <!-- Flash Gap Warning -->
    <div
      v-if="hasFlashGap"
      class="bg-accent-warning/10 border border-accent-warning rounded-lg p-3"
    >
      <div class="text-sm font-semibold text-accent-warning mb-1">⚠ Flash Gap Detected</div>
      <div class="text-xs text-secondary">
        There may be a brief period with no active flow. Consider adding a segment or adjusting timing.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { StagePreview } from "~/types/ops-schema-enhanced";

const props = defineProps<{
  preview: StagePreview;
}>();

const hasFlashGap = computed(() => {
  // Simple heuristic: if customer screen shows "Intermission" or "No active flow"
  return (
    props.preview.customerScreen === "Intermission" ||
    props.preview.activeFlow === "No active flow"
  );
});
</script>

<style scoped>
/* Premium spacing */
.space-y-4 > * {
  margin-bottom: 1rem;
}

.space-y-4 > *:last-child {
  margin-bottom: 0;
}
</style>