<template>
  <div class="h-full min-h-0 flex flex-col bg-base">
    <!-- Toolbar -->
    <div class="bg-surface border-b border-divider px-4 py-3 space-y-3">
      <!-- Top Row: Title & Primary Actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <p class="text-xs font-bold text-tertiary uppercase tracking-widest">
              Operations Studio
            </p>
            <h1 class="text-lg font-semibold text-primary">
              Rate Cards + Timeline
            </h1>
          </div>
          
          <!-- Issues Indicator -->
          <button
            v-if="violations.length > 0"
            class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent-error/10 text-accent-error hover:bg-accent-error/20 transition-colors"
            @click="showIssuesPanel = !showIssuesPanel"
          >
            <span class="font-semibold text-sm">{{ violations.length }} Issues</span>
            <span class="text-xs">ⓘ</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <!-- Primary Actions -->
          <BaseButtonEnhanced
            variant="primary"
            size="small"
            label="+ Overlay"
            @click="addOverlayEvent"
          />
          <BaseButtonEnhanced
            variant="primary"
            size="small"
            label="+ Trigger"
            @click="addTrigger"
          />
          
          <!-- Secondary Actions -->
          <BaseButtonEnhanced
            variant="secondary"
            size="small"
            label="Export"
            @click="exportAgenda"
          />
          <BaseButtonEnhanced
            variant="success"
            size="small"
            label="Simulate"
            @click="startSimulation"
          />
        </div>
      </div>

      <!-- Controls Row -->
      <div class="flex items-center gap-4 flex-wrap">
        <!-- Operational Hours -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-secondary font-medium">Hours:</span>
          <input
            v-model="operationalHours.start"
            type="time"
            class="px-2 py-1 text-sm border border-divider rounded bg-base w-20"
            @change="updateOperationalHours"
          />
          <span class="text-secondary">→</span>
          <input
            v-model="operationalHours.end"
            type="time"
            class="px-2 py-1 text-sm border border-divider rounded bg-base w-20"
            @change="updateOperationalHours"
          />
        </div>

        <!-- Snap Control -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-secondary font-medium">Snap:</span>
          <select
            v-model="snapIncrement"
            class="px-2 py-1 text-sm border border-divider rounded bg-base"
          >
            <option :value="15">15m</option>
            <option :value="30">30m</option>
            <option :value="60">60m</option>
          </select>
        </div>

        <!-- Zoom Control -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-secondary font-medium">Zoom:</span>
          <select
            v-model="zoomLevel"
            class="px-2 py-1 text-sm border border-divider rounded bg-base"
          >
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="detail">Detail</option>
          </select>
        </div>

        <!-- Toggles -->
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" v-model="showGaps" class="rounded" />
            <span class="text-secondary">Gaps</span>
          </label>
          <label class="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" v-model="showGrid" class="rounded" />
            <span class="text-secondary">Grid</span>
          </label>
          <label class="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" v-model="showLabels" class="rounded" />
            <span class="text-secondary">Labels</span>
          </label>
          <label class="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" v-model="showHeatmap" class="rounded" />
            <span class="text-secondary">Heatmap</span>
          </label>
        </div>

        <!-- Tools -->
        <div class="flex items-center gap-2 ml-auto">
          <span class="text-xs text-secondary font-medium">Tool:</span>
          <button
            v-for="tool in ['standard', 'ripple', 'knife']"
            :key="tool"
            class="px-3 py-1 text-xs rounded border transition-colors"
            :class="
              activeTool === tool
                ? 'bg-accent-primary text-white border-accent-primary'
                : 'bg-base border-divider text-primary hover:border-accent-primary'
            "
            @click="activeTool = tool"
          >
            {{ tool === 'ripple' ? 'Ripple Edit' : tool === 'knife' ? 'Knife' : 'Standard' }}
          </button>
        </div>
      </div>

      <!-- Ripple Options (when active) -->
      <div v-if="activeTool === 'ripple'" class="flex items-center gap-4 text-xs">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="rippleOptions.preserveSpacing" />
          <span class="text-secondary">Preserve Spacing</span>
        </label>
        <label class="flex items-center gap-2">
          <span class="text-secondary">Min Duration:</span>
          <input
            type="number"
            v-model.number="rippleOptions.minDuration"
            class="w-16 px-2 py-1 border border-divider rounded bg-base"
            min="5"
            max="60"
          />
          <span class="text-secondary">minutes</span>
        </label>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 min-h-0 flex overflow-hidden">
      <!-- Left Pane: Rate Card Library -->
      <div
        class="bg-surface border-r border-divider flex flex-col transition-all duration-200"
        :style="{ width: leftPaneWidth + 'px' }"
        v-show="!leftPaneCollapsed"
      >
        <div class="p-3 border-b border-divider flex items-center justify-between">
          <div>
            <p class="text-xs text-tertiary font-bold uppercase tracking-widest">Library</p>
            <h2 class="text-sm font-semibold text-primary">Rate Cards</h2>
          </div>
          <div class="flex gap-1">
            <button
              class="p-1 text-xs text-accent-primary hover:bg-base rounded"
              @click="addRateCard"
              title="Add Rate Card"
            >+</button>
            <button
              class="p-1 text-xs text-secondary hover:bg-base rounded"
              @click="leftPaneCollapsed = true"
              title="Collapse"
            >←</button>
          </div>
        </div>

        <!-- Search -->
        <div class="px-3 py-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search rate cards..."
            class="w-full px-3 py-2 text-sm border border-divider rounded bg-base focus:ring-accent-primary"
          />
        </div>

        <!-- Rate Cards List -->
        <div class="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
          <div
            v-for="card in filteredRateCards"
            :key="card.id"
            class="group p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm"
            :class="
              selected?.id === card.id && selected?.type === 'rateCard'
                ? 'border-accent-primary bg-accent-primary/5'
                : 'border-divider bg-base hover:border-accent-primary'
            "
            draggable="true"
            @dragstart="handleRateCardDragStart(card, $event)"
            @click="selectItem('rateCard', card.id)"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: card.color || '#64748b' }"
                />
                <span class="font-semibold text-primary text-sm">{{ card.name }}</span>
              </div>
              <span class="text-xs text-tertiary">{{ card.category || 'Standard' }}</span>
            </div>
            <div class="text-xs text-secondary">
              {{ card.yield_configuration.mode.replace('_', ' ') }}
              <span v-if="card.yield_configuration.active_bundles.length">
                • {{ card.yield_configuration.active_bundles.length }} bundles
              </span>
            </div>
          </div>

          <div
            v-if="filteredRateCards.length === 0"
            class="text-center py-8 text-sm text-tertiary"
          >
            No rate cards found
          </div>
        </div>
      </div>

      <!-- Left Pane Collapse Button -->
      <div
        v-if="leftPaneCollapsed"
        class="w-12 bg-surface border-r border-divider flex items-center justify-center"
      >
        <button
          class="p-2 text-accent-primary hover:bg-base rounded"
          @click="leftPaneCollapsed = false"
          title="Expand Library"
        >→</button>
      </div>

      <!-- Center Pane: Timeline Canvas -->
      <div class="flex-1 min-w-0 flex flex-col bg-base overflow-hidden">
        <TimelineCanvasEnhanced
          :flow-segments="flowSegments"
          :overlay-events="overlayEvents"
          :logic-triggers="logicTriggers"
          :rate-cards="rateCards"
          :operational-start="operationalHours.start"
          :operational-end="operationalHours.end"
          :density="zoomLevel"
          :selected-id="selected?.id"
          :selected-type="selected?.type"
          :show-gaps="showGaps"
          :show-grid="showGrid"
          :show-labels="showLabels"
          :show-heatmap="showHeatmap"
          :active-tool="activeTool"
          :ripple-options="rippleOptions"
          :snap-increment="snapIncrement"
          :violations="violations"
          @select="selectItem"
          @add-segment="addSegmentFromDrop"
          @update-segment="updateSegmentTime"
          @update-overlay="updateOverlayTime"
          @update-trigger="updateTriggerTime"
          @split-segment="splitSegment"
          @error="setError"
          @zoom="handleZoom"
        />
      </div>

      <!-- Right Pane: Inspector -->
      <div
        class="bg-surface border-l border-divider flex flex-col transition-all duration-200"
        :style="{ width: rightPaneWidth + 'px' }"
        v-show="!rightPaneCollapsed"
      >
        <div class="p-3 border-b border-divider flex items-center justify-between">
          <div>
            <p class="text-xs text-tertiary font-bold uppercase tracking-widest">Inspector</p>
            <h2 class="text-sm font-semibold text-primary">{{ inspectorTitle }}</h2>
          </div>
          <div class="flex gap-1">
            <button
              class="p-1 text-xs text-secondary hover:bg-base rounded"
              @click="rightPaneCollapsed = true"
              title="Collapse"
            >→</button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto">
          <TimelineInspectorEnhanced
            :selected="selected"
            :rate-cards="rateCards"
            :flow-segments="flowSegments"
            :overlay-events="overlayEvents"
            :logic-triggers="logicTriggers"
            :available-bundles="schema.definitions?.bundles || []"
            :violations="violations"
            :is-dirty="isDirty"
            :is-saving="isSaving"
            @update-rate-card="updateRateCard"
            @update-segment="updateSegment"
            @update-overlay="updateOverlay"
            @update-trigger="updateTrigger"
            @create-linked-overlay="createLinkedOverlay"
            @delete="removeSelection"
            @apply-changes="applyChanges"
            @select="selectItem"
          />
        </div>
      </div>

      <!-- Right Pane Collapse Button -->
      <div
        v-if="rightPaneCollapsed"
        class="w-12 bg-surface border-l border-divider flex items-center justify-center"
      >
        <button
          class="p-2 text-accent-primary hover:bg-base rounded"
          @click="rightPaneCollapsed = false"
          title="Expand Inspector"
        >←</button>
      </div>
    </div>

    <!-- Issues Panel (Modal) -->
    <div
      v-if="showIssuesPanel"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showIssuesPanel = false"
    >
      <div class="bg-surface rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div class="p-4 border-b border-divider flex items-center justify-between">
          <h3 class="font-semibold text-primary">Constraint Violations</h3>
          <button
            class="text-secondary hover:text-primary"
            @click="showIssuesPanel = false"
          >✕</button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="violation in violations"
            :key="violation.id"
            class="p-3 rounded border"
            :class="{
              'border-accent-error bg-accent-error/5': violation.severity === 'error',
              'border-accent-warning bg-accent-warning/5': violation.severity === 'warning',
              'border-accent-info bg-accent-info/5': violation.severity === 'info',
            }"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm">{{ violation.message }}</span>
                  <span
                    class="text-xs px-2 py-0.5 rounded uppercase"
                    :class="{
                      'bg-accent-error/20 text-accent-error': violation.severity === 'error',
                      'bg-accent-warning/20 text-accent-warning': violation.severity === 'warning',
                      'bg-accent-info/20 text-accent-info': violation.severity === 'info',
                    }"
                  >{{ violation.severity }}</span>
                </div>
                <div class="text-xs text-secondary">
                  Constraint: {{ getConstraintLabel(violation.constraintId) }}
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  v-if="canFixViolation(violation)"
                  class="text-xs px-2 py-1 bg-accent-primary text-white rounded hover:bg-blue-600"
                  @click="fixViolation(violation)"
                >
                  Fix
                </button>
                <button
                  v-if="violation.affectedIds.length > 0"
                  class="text-xs px-2 py-1 bg-surface border border-divider rounded hover:bg-base"
                  @click="jumpToViolation(violation)"
                >
                  Jump To
                </button>
              </div>
            </div>
          </div>

          <div v-if="violations.length === 0" class="text-center py-8 text-sm text-accent-success">
            ✓ No violations found
          </div>
        </div>

        <div class="p-4 border-t border-divider flex justify-end gap-2">
          <BaseButtonEnhanced
            variant="secondary"
            size="small"
            label="Fix All"
            :disabled="violations.filter(v => canFixViolation(v)).length === 0"
            @click="fixAllViolations"
          />
          <BaseButtonEnhanced
            variant="primary"
            size="small"
            label="Close"
            @click="showIssuesPanel = false"
          />
        </div>
      </div>
    </div>

    <!-- Simulation Modal -->
    <div
      v-if="showSimulation"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showSimulation = false"
    >
      <div class="bg-surface rounded-lg shadow-xl w-[800px] max-h-[90vh] flex flex-col">
        <div class="p-4 border-b border-divider flex items-center justify-between">
          <h3 class="font-semibold text-primary">Simulation Mode</h3>
          <button
            class="text-secondary hover:text-primary"
            @click="showSimulation = false"
          >✕</button>
        </div>
        
        <div class="flex-1 overflow-hidden flex">
          <!-- Timeline -->
          <div class="flex-1 p-4 overflow-y-auto">
            <SimulationTimeline
              :schema="schema"
              :simulation-state="simulationState"
              @update-time="updateSimulationTime"
              @play="playSimulation"
              @pause="pauseSimulation"
              @change-speed="changeSimulationSpeed"
            />
          </div>
          
          <!-- Stage Preview -->
          <div class="w-80 border-l border-divider p-4 overflow-y-auto bg-base">
            <StagePreviewComponent :preview="stagePreview" />
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <div
      v-if="showExport"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showExport = false"
    >
      <div class="bg-surface rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div class="p-4 border-b border-divider flex items-center justify-between">
          <h3 class="font-semibold text-primary">Export Agenda</h3>
          <button
            class="text-secondary hover:text-primary"
            @click="showExport = false"
          >✕</button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="exportOptions.includeContext" />
              <span class="text-sm">Include Context</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="exportOptions.sortByTime" />
              <span class="text-sm">Sort by Time</span>
            </label>
          </div>

          <textarea
            :value="exportContent"
            readonly
            class="w-full h-64 px-3 py-2 text-sm font-mono border border-divider rounded bg-base resize-none"
          />
        </div>

        <div class="p-4 border-t border-divider flex justify-end gap-2">
          <BaseButtonEnhanced
            variant="secondary"
            size="small"
            label="Copy to Clipboard"
            @click="copyToClipboard"
          />
          <BaseButtonEnhanced
            variant="primary"
            size="small"
            label="Print"
            @click="printAgenda"
          />
        </div>
      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 px-4 py-3 bg-accent-error text-white rounded-lg shadow-lg z-50 flex items-center gap-2"
    >
      <span>⚠</span>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import type {
  OpsSchemaV2,
  OpsSchemaRateCard,
  OpsSchemaFlowSegment,
  OpsSchemaOverlayEvent,
  OpsSchemaLogicTrigger,
} from "~/types/ops-schema";

import type {
  EnhancedOpsSchema,
  EnhancedLogicTrigger,
  StudioUIState,
  ConstraintViolation,
  SimulationState,
  StagePreview,
  AgendaEntry,
} from "~/types/ops-schema-enhanced";

import {
  calculateScrollAwareX,
  enhancedSnapMinutes,
  applyRipple,
  applyKnifeSplit,
  resolveRelativeTriggers,
  deriveSimulationState,
  deriveStagePreview,
  generateAgenda,
  formatAgendaForExport,
} from "~/utils/ops-schema-enhanced.utils";

import {
  ConstraintManager,
  checkAllConstraints,
  getViolationSummary,
} from "~/utils/constraints";

import { toMinutes, formatMinutes, normalizeTimeRange } from "~/utils/ops-schema.utils";

// Components
import BaseButtonEnhanced from "~/components/ui/BaseButtonEnhanced.vue";
import TimelineCanvasEnhanced from "~/components/admin/ops/TimelineCanvasEnhanced.vue";
import TimelineInspectorEnhanced from "~/components/admin/ops/TimelineInspectorEnhanced.vue";
import SimulationTimeline from "~/components/admin/ops/SimulationTimeline.vue";
import StagePreviewComponent from "~/components/admin/ops/StagePreview.vue";

// Props
const props = defineProps<{
  modelValue: OpsSchemaV2;
  density?: "compact" | "standard" | "detail";
}>();

const emit = defineEmits(["update:modelValue", "update:density"]);

// ===== STATE =====

// Core schema state
const schema = ref<EnhancedOpsSchema>(props.modelValue as EnhancedOpsSchema);
const isSyncing = ref(false);

// UI State
const leftPaneWidth = ref(280);
const rightPaneWidth = ref(380);
const leftPaneCollapsed = ref(false);
const rightPaneCollapsed = ref(false);

const operationalHours = ref({
  start: props.modelValue.timeline.operationalHours.start,
  end: props.modelValue.timeline.operationalHours.end,
});

const snapIncrement = ref(30);
const zoomLevel = ref<"compact" | "standard" | "detail">(props.density || "standard");
const showGaps = ref(true);
const showGrid = ref(true);
const showLabels = ref(true);
const showHeatmap = ref(false);

const activeTool = ref<"standard" | "ripple" | "knife">("standard");
const rippleOptions = ref({
  enabled: true,
  preserveSpacing: true,
  minDuration: 15,
});

const snapSettings = ref({
  gridIncrement: 30,
  anchorSnapEnabled: true,
  anchorThreshold: 10,
  showGuideLines: true,
});

// Selection
const selected = ref<{
  type: "rateCard" | "segment" | "overlay" | "trigger";
  id: string;
} | null>(null);

// Search
const searchQuery = ref("");

// Validation & Constraints
const constraintManager = ref(new ConstraintManager());
const violations = ref<ConstraintViolation[]>([]);
const showIssuesPanel = ref(false);

// Inspector State
const isDirty = ref(false);
const isSaving = ref(false);

// Simulation
const showSimulation = ref(false);
const simulationState = ref<SimulationState>({
  isPlaying: false,
  currentTime: 0,
  speed: 1,
  events: [],
  activeOverlays: [],
});
const simulationInterval = ref<number | null>(null);

// Export
const showExport = ref(false);
const exportOptions = ref({
  format: "clipboard" as "clipboard" | "print",
  includeContext: true,
  sortByTime: true,
});

// Error
const error = ref("");

// ===== COMPUTED =====

const rateCards = computed(() => schema.value.definitions.rateCards ?? []);
const flowSegments = computed(() => schema.value.timeline.flowSegments ?? []);
const overlayEvents = computed(() => schema.value.timeline.overlayEvents ?? []);
const logicTriggers = computed(() => schema.value.logicTriggers ?? []);

const filteredRateCards = computed(() => {
  if (!searchQuery.value.trim()) return rateCards.value;
  const term = searchQuery.value.toLowerCase();
  return rateCards.value.filter(
    card =>
      card.name.toLowerCase().includes(term) ||
      card.category?.toLowerCase().includes(term)
  );
});

const inspectorTitle = computed(() => {
  if (!selected.value) return "No Selection";
  const titles = {
    rateCard: "Rate Card",
    segment: "Flow Segment",
    overlay: "Overlay Event",
    trigger: "Logic Trigger",
  };
  return titles[selected.value.type];
});

const exportContent = computed(() => {
  const agenda = generateAgenda(schema.value);
  return formatAgendaForExport(agenda, exportOptions.value);
});

const stagePreview = computed(() => {
  return deriveStagePreview(simulationState.value, schema.value);
});

// ===== METHODS =====

// Selection
const selectItem = (type: "rateCard" | "segment" | "overlay" | "trigger", id: string) => {
  selected.value = { type, id };
  isDirty.value = false;
};

// Rate Cards
const addRateCard = () => {
  const id = `rate-${Date.now()}`;
  schema.value.definitions.rateCards.push({
    id,
    name: "New Rate Card",
    category: "Standard",
    color: "#64748b",
    yield_configuration: {
      mode: "standard_rate",
      active_bundles: [],
    },
  });
  selectItem("rateCard", id);
  validate();
};

const updateRateCard = (updated: OpsSchemaRateCard) => {
  const idx = schema.value.definitions.rateCards.findIndex(c => c.id === updated.id);
  if (idx >= 0) {
    schema.value.definitions.rateCards[idx] = updated;
    isDirty.value = true;
    validate();
  }
};

// Segments
const addSegmentFromDrop = (payload: {
  rateCardId: string;
  time_start: string;
  time_end: string;
}) => {
  const rateCard = rateCards.value.find(c => c.id === payload.rateCardId);
  if (!rateCard) {
    setError("Rate card not found");
    return;
  }

  const id = `segment-${Date.now()}`;
  const newSegment: OpsSchemaFlowSegment = {
    id,
    label: rateCard.name,
    time_start: payload.time_start,
    time_end: payload.time_end,
    rate_card_id: payload.rateCardId,
    color_code: rateCard.color,
    allow_overlap: false,
  };

  // Apply ripple if active
  if (activeTool.value === "ripple") {
    const result = applyRipple(
      [...flowSegments.value, newSegment],
      id,
      0,
      "move",
      rippleOptions.value
    );
    if (result.error) {
      setError(result.error);
      return;
    }
    schema.value.timeline.flowSegments = result.segments;
  } else {
    schema.value.timeline.flowSegments.push(newSegment);
  }

  selectItem("segment", id);
  validate();
};

const updateSegmentTime = (payload: {
  id: string;
  time_start: string;
  time_end: string;
}) => {
  const segment = flowSegments.value.find(s => s.id === payload.id);
  if (!segment) return;

  // Apply ripple if active
  if (activeTool.value === "ripple") {
    const oldRange = normalizeTimeRange(segment.time_start, segment.time_end);
    const newRange = normalizeTimeRange(payload.time_start, payload.time_end);
    const delta = newRange.start - oldRange.start;

    const result = applyRipple(
      flowSegments.value,
      payload.id,
      delta,
      "move",
      rippleOptions.value
    );
    if (result.error) {
      setError(result.error);
      return;
    }
    schema.value.timeline.flowSegments = result.segments;
  } else {
    segment.time_start = payload.time_start;
    segment.time_end = payload.time_end;
  }

  isDirty.value = true;
  validate();
};

const updateOverlayTime = (payload: {
  id: string;
  time_start: string;
  time_end: string;
}) => {
  const overlay = overlayEvents.value.find(e => e.id === payload.id);
  if (overlay) {
    overlay.time_start = payload.time_start;
    overlay.time_end = payload.time_end;
    isDirty.value = true;
    validate();
  }
};

const updateTriggerTime = (payload: {
  id: string;
  trigger_time: string;
}) => {
  const trigger = logicTriggers.value.find(t => t.id === payload.id);
  if (trigger) {
    trigger.trigger_time = payload.trigger_time;
    isDirty.value = true;
    validate();
  }
};

const splitSegment = (payload: { id: string; time: string }) => {
  if (activeTool.value !== "knife") {
    setError("Knife tool must be active to split segments");
    return;
  }

  const result = applyKnifeSplit(
    flowSegments.value,
    payload.id,
    payload.time,
    15
  );

  if (result.error) {
    setError(result.error);
    return;
  }

  schema.value.timeline.flowSegments = result.segments;
  if (result.newSegmentId) {
    selectItem("segment", result.newSegmentId);
  }
  validate();
};

const updateSegment = (updated: OpsSchemaFlowSegment) => {
  const idx = flowSegments.value.findIndex(s => s.id === updated.id);
  if (idx >= 0) {
    schema.value.timeline.flowSegments[idx] = updated;
    isDirty.value = true;
    validate();
  }
};

// Overlays
const addOverlayEvent = () => {
  const id = `event-${Date.now()}`;
  // Add buffer to avoid boundary constraints
  const startMins = toMinutes(operationalHours.value.start);
  const endMins = toMinutes(operationalHours.value.end);
  
  schema.value.timeline.overlayEvents.push({
    id,
    label: "Overlay Event",
    time_start: formatMinutes(startMins + 15),
    time_end: formatMinutes(endMins - 15),
    is_hard_ticket: false,
  });
  selectItem("overlay", id);
  validate();
};

const updateOverlay = (updated: OpsSchemaOverlayEvent) => {
  const idx = overlayEvents.value.findIndex(e => e.id === updated.id);
  if (idx >= 0) {
    schema.value.timeline.overlayEvents[idx] = updated;
    isDirty.value = true;
    validate();
  }
};

// Triggers
const addTrigger = () => {
  const id = `trigger-${Date.now()}`;
  const startMins = toMinutes(operationalHours.value.start);
  
  const newTrigger: EnhancedLogicTrigger = {
    id,
    trigger_time: formatMinutes(startMins + 15),
    type: "doors_open",
    isRelative: false,
  };
  schema.value.logicTriggers.push(newTrigger);
  selectItem("trigger", id);
  validate();
};

const updateTrigger = (updated: EnhancedLogicTrigger) => {
  const idx = logicTriggers.value.findIndex(t => t.id === updated.id);
  if (idx >= 0) {
    // Resolve relative triggers
    if (updated.isRelative && updated.relativeAnchor) {
      const resolved = resolveRelativeTriggers(
        [updated],
        flowSegments.value,
        overlayEvents.value
      );
      schema.value.logicTriggers[idx] = resolved[0];
    } else {
      schema.value.logicTriggers[idx] = updated;
    }
    isDirty.value = true;
    validate();
  }
};

const createLinkedOverlay = (triggerId: string, name: string) => {
  // Create the overlay
  const overlayId = `event-${Date.now()}`;
  const startMins = toMinutes(operationalHours.value.start);
  const endMins = toMinutes(operationalHours.value.end);

  schema.value.timeline.overlayEvents.push({
    id: overlayId,
    label: name,
    time_start: formatMinutes(startMins + 15),
    time_end: formatMinutes(endMins - 15),
    is_hard_ticket: false,
  });
  
  // Link it to the trigger
  const triggerIdx = logicTriggers.value.findIndex(t => t.id === triggerId);
  if (triggerIdx >= 0) {
    const trigger = schema.value.logicTriggers[triggerIdx];
    trigger.target_event = overlayId;
    updateTrigger(trigger);
  }
  
  validate();
};

// Removal
const removeSelection = () => {
  if (!selected.value) return;

  const { type, id } = selected.value;

  if (type === "rateCard") {
    schema.value.definitions.rateCards = rateCards.value.filter(c => c.id !== id);
  } else if (type === "segment") {
    schema.value.timeline.flowSegments = flowSegments.value.filter(s => s.id !== id);
  } else if (type === "overlay") {
    schema.value.timeline.overlayEvents = overlayEvents.value.filter(e => e.id !== id);
  } else if (type === "trigger") {
    schema.value.logicTriggers = logicTriggers.value.filter(t => t.id !== id);
  }

  selected.value = null;
  isDirty.value = true;
  validate();
};

// Operational Hours
const updateOperationalHours = () => {
  schema.value.timeline.operationalHours.start = operationalHours.value.start;
  schema.value.timeline.operationalHours.end = operationalHours.value.end;
  isDirty.value = true;
  validate();
};

// Validation
const validate = () => {
  violations.value = checkAllConstraints(schema.value);
};

const setError = (message: string) => {
  error.value = message;
  setTimeout(() => {
    error.value = "";
  }, 3000);
};

// Constraint Fixes
const canFixViolation = (violation: ConstraintViolation): boolean => {
  const constraint = constraintManager.value.getConstraint(violation.constraintId);
  return !!constraint?.fix;
};

const fixViolation = (violation: ConstraintViolation) => {
  const result = constraintManager.value.applyFixes(schema.value, [violation]);
  if (result.fixed.length > 0) {
    schema.value = result.state as EnhancedOpsSchema;
    validate();
  }
};

const fixAllViolations = () => {
  const fixable = violations.value.filter(v => canFixViolation(v));
  const result = constraintManager.value.applyFixes(schema.value, fixable);
  if (result.fixed.length > 0) {
    schema.value = result.state as EnhancedOpsSchema;
    validate();
  }
};

const jumpToViolation = (violation: ConstraintViolation) => {
  if (violation.affectedIds.length > 0) {
    const id = violation.affectedIds[0];
    // Try to find what type this ID belongs to
    const segment = flowSegments.value.find(s => s.id === id);
    if (segment) {
      selectItem("segment", id);
      showIssuesPanel.value = false;
      return;
    }
    const overlay = overlayEvents.value.find(o => o.id === id);
    if (overlay) {
      selectItem("overlay", id);
      showIssuesPanel.value = false;
      return;
    }
    const trigger = logicTriggers.value.find(t => t.id === id);
    if (trigger) {
      selectItem("trigger", id);
      showIssuesPanel.value = false;
      return;
    }
  }
};

const getConstraintLabel = (id: string): string => {
  const constraint = constraintManager.value.getConstraint(id);
  return constraint?.label || id;
};

// Inspector Actions
const applyChanges = () => {
  isSaving.value = true;
  setTimeout(() => {
    isSaving.value = false;
    isDirty.value = false;
    validate();
  }, 500);
};

// Zoom
const handleZoom = (delta: number) => {
  const order: Array<"compact" | "standard" | "detail"> = ["compact", "standard", "detail"];
  const currentIndex = order.indexOf(zoomLevel.value);
  const nextIndex = delta > 0 ? currentIndex - 1 : currentIndex + 1;
  const next = order[Math.max(0, Math.min(order.length - 1, nextIndex))];
  if (next !== zoomLevel.value) {
    zoomLevel.value = next;
    emit("update:density", next);
  }
};

// Drag & Drop
const handleRateCardDragStart = (card: OpsSchemaRateCard, event: DragEvent) => {
  event.dataTransfer?.setData(
    "application/x-ops-ratecard",
    JSON.stringify({ id: card.id })
  );
  event.dataTransfer?.setData("text/plain", card.id);
};

// Simulation
const startSimulation = () => {
  showSimulation.value = true;
  simulationState.value.currentTime = toMinutes(operationalHours.value.start);
  simulationState.value.isPlaying = false;
};

const updateSimulationTime = (time: number) => {
  simulationState.value.currentTime = time;
  simulationState.value = deriveSimulationState(
    schema.value,
    time,
    simulationState.value.speed
  );
};

const playSimulation = () => {
  simulationState.value.isPlaying = true;
  simulationInterval.value = setInterval(() => {
    if (simulationState.value.currentTime >= toMinutes(operationalHours.value.end)) {
      pauseSimulation();
      return;
    }
    simulationState.value.currentTime += simulationState.value.speed;
    simulationState.value = deriveSimulationState(
      schema.value,
      simulationState.value.currentTime,
      simulationState.value.speed
    );
  }, 100) as unknown as number;
};

const pauseSimulation = () => {
  simulationState.value.isPlaying = false;
  if (simulationInterval.value) {
    clearInterval(simulationInterval.value);
    simulationInterval.value = null;
  }
};

const changeSimulationSpeed = (speed: 1 | 10 | 60) => {
  simulationState.value.speed = speed;
  if (simulationState.value.isPlaying) {
    pauseSimulation();
    playSimulation();
  }
};

// Export
const exportAgenda = () => {
  showExport.value = true;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportContent.value);
    setError("Copied to clipboard!");
  } catch (err) {
    setError("Failed to copy to clipboard");
  }
};

const printAgenda = () => {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Operations Agenda</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            h1 { border-bottom: 2px solid #000; padding-bottom: 10px; }
            .entry { margin: 10px 0; }
            .time { font-weight: bold; }
            .lane { color: #666; }
            .context { color: #888; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <h1>Operations Agenda</h1>
          ${exportContent.value.split('\n').map(line => {
            if (line.includes('[')) {
              const parts = line.split('[');
              const time = parts[0].trim();
              const rest = parts[1].split(']');
              const lane = rest[0];
              const label = rest[1];
              return `<div class="entry"><span class="time">${time}</span> [<span class="lane">${lane}</span>] ${label}</div>`;
            }
            return `<div>${line}</div>`;
          }).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

// ===== WATCHERS =====

// Sync with parent
watch(
  () => props.modelValue,
  (value) => {
    isSyncing.value = true;
    schema.value = value as EnhancedOpsSchema;
    operationalHours.value = {
      start: value.timeline.operationalHours.start,
      end: value.timeline.operationalHours.end,
    };
    setTimeout(() => {
      isSyncing.value = false;
    }, 0);
  },
  { deep: true }
);

// Emit changes to parent
watch(
  schema,
  (value) => {
    if (!isSyncing.value) {
      emit("update:modelValue", value);
    }
  },
  { deep: true }
);

// Auto-validate on changes
watch(
  [flowSegments, overlayEvents, logicTriggers],
  () => {
    if (!isSyncing.value) {
      validate();
    }
  },
  { deep: true }
);

// ===== LIFECYCLE =====

onMounted(() => {
  validate();
});

onBeforeUnmount(() => {
  if (simulationInterval.value) {
    clearInterval(simulationInterval.value);
  }
});
</script>

<style scoped>
/* Smooth transitions for pane resizing */
.bg-surface,
.bg-base {
  transition: background-color 0.2s ease;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus rings for accessibility */
button:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 2px solid #0A84FF;
  outline-offset: 2px;
}
</style>