<template>
  <div class="h-full flex flex-col">
    <!-- Loading State -->
    <div v-if="isSaving" class="p-4 text-center text-sm text-tertiary">
      <div class="inline-block w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mr-2"></div>
      Saving...
    </div>

    <!-- Content -->
    <div v-else class="flex-1 overflow-y-auto">
      <!-- Rate Card Inspector -->
      <div v-if="selected.type === 'rateCard'" class="space-y-4 p-4">
        <div class="space-y-3">
          <InspectorField
            id="rc-name"
            label="Name"
            v-model="editingRateCard.name"
            type="text"
            required
            helper-text="Display name for this rate card"
            :status="fieldStatus('name')"
            @update:model-value="markDirty('rateCard')"
          />

          <InspectorField
            id="rc-category"
            label="Category"
            v-model="editingRateCard.category"
            type="text"
            helper-text="Grouping for organization (e.g., VIP, Standard, Promo)"
            :status="fieldStatus('category')"
            @update:model-value="markDirty('rateCard')"
          />

          <InspectorField
            id="rc-color"
            label="Color"
            v-model="editingRateCard.color"
            type="color"
            helper-text="Visual identifier on timeline"
            :status="fieldStatus('color')"
            @update:model-value="markDirty('rateCard')"
          />

          <InspectorField
            id="rc-yield-mode"
            label="Yield Mode"
            v-model="editingRateCard.yield_configuration.mode"
            type="select"
            :options="[
              { value: 'fixed_rate', label: 'Fixed Rate' },
              { value: 'standard_rate', label: 'Standard Rate' },
              { value: 'reduced_rate', label: 'Reduced Rate' },
            ]"
            helper-text="Pricing strategy for this rate card"
            :status="fieldStatus('yield_configuration.mode')"
            @update:model-value="markDirty('rateCard')"
          />
        </div>

        <div class="pt-4 border-t border-divider">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold text-primary">Active Bundles</h3>
            <button
              class="text-xs text-accent-primary hover:underline"
              @click="addBundle"
            >+ Add Bundle</button>
          </div>
          
          <div v-if="editingRateCard.yield_configuration.active_bundles.length === 0" class="text-xs text-tertiary py-2">
            No bundles configured
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="(bundle, idx) in editingRateCard.yield_configuration.active_bundles"
              :key="idx"
              class="flex items-center gap-2 p-2 bg-base rounded border border-divider"
            >
              <input
                v-model="bundle.name"
                type="text"
                placeholder="Bundle name"
                class="flex-1 px-2 py-1 text-xs border border-divider rounded bg-surface"
              />
              <input
                v-model.number="bundle.discount"
                type="number"
                step="0.1"
                placeholder="Discount"
                class="w-20 px-2 py-1 text-xs border border-divider rounded bg-surface"
              />
              <button
                class="text-xs text-accent-error hover:underline"
                @click="removeBundle(idx)"
              >Remove</button>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-divider">
          <div class="flex gap-2">
            <BaseButtonEnhanced
              variant="primary"
              size="small"
              label="Apply Changes"
              :disabled="!isDirty"
              @click="applyRateCardChanges"
            />
            <BaseButtonEnhanced
              variant="danger"
              size="small"
              label="Delete"
              @click="deleteSelection"
            />
          </div>
        </div>
      </div>

      <!-- Flow Segment Inspector -->
      <div v-if="selected.type === 'segment'" class="space-y-4 p-4">
        <div class="space-y-3">
          <InspectorField
            id="seg-label"
            label="Label"
            v-model="editingSegment.label"
            type="text"
            required
            helper-text="Display name for this segment"
            :status="fieldStatus('label')"
            @update:model-value="markDirty('segment')"
          />

          <InspectorField
            id="seg-start"
            label="Start Time"
            v-model="editingSegment.time_start"
            type="time"
            required
            helper-text="When this segment begins"
            :status="fieldStatus('time_start')"
            @update:model-value="markDirty('segment')"
          />

          <InspectorField
            id="seg-end"
            label="End Time"
            v-model="editingSegment.time_end"
            type="time"
            required
            helper-text="When this segment ends"
            :status="fieldStatus('time_end')"
            @update:model-value="markDirty('segment')"
          />

          <InspectorField
            id="seg-rate-card"
            label="Rate Card"
            v-model="editingSegment.rate_card_id"
            type="select"
            :options="rateCardOptions"
            helper-text="Pricing template for this segment"
            :status="fieldStatus('rate_card_id')"
            @update:model-value="markDirty('segment')"
          />

          <InspectorField
            id="seg-color"
            label="Color Override"
            v-model="editingSegment.color_code"
            type="color"
            helper-text="Optional: Override rate card color"
            :status="fieldStatus('color_code')"
            @update:model-value="markDirty('segment')"
          />

          <div class="flex items-center gap-2">
            <input
              id="seg-overlap"
              type="checkbox"
              v-model="editingSegment.allow_overlap"
              class="rounded"
            />
            <label for="seg-overlap" class="text-sm text-secondary">
              Allow Overlap
            </label>
          </div>
        </div>

        <div class="pt-4 border-t border-divider">
          <div class="flex gap-2">
            <BaseButtonEnhanced
              variant="primary"
              size="small"
              label="Apply Changes"
              :disabled="!isDirty"
              @click="applySegmentChanges"
            />
            <BaseButtonEnhanced
              variant="danger"
              size="small"
              label="Delete"
              @click="deleteSelection"
            />
          </div>
        </div>

        <!-- Validation Errors -->
        <div v-if="segmentErrors.length > 0" class="pt-2 space-y-1">
          <div
            v-for="error in segmentErrors"
            :key="error"
            class="text-xs text-accent-error flex items-center gap-1"
          >
            <span>⚠</span> {{ error }}
          </div>
        </div>
      </div>

      <!-- Overlay Event Inspector -->
      <div v-if="selected.type === 'overlay'" class="space-y-4 p-4">
        <div class="space-y-3">
          <InspectorField
            id="ov-label"
            label="Label"
            v-model="editingOverlay.label"
            type="text"
            required
            helper-text="Display name for this overlay event"
            :status="fieldStatus('label')"
            @update:model-value="markDirty('overlay')"
          />

          <InspectorField
            id="ov-start"
            label="Start Time"
            v-model="editingOverlay.time_start"
            type="time"
            required
            helper-text="When this overlay begins"
            :status="fieldStatus('time_start')"
            @update:model-value="markDirty('overlay')"
          />

          <InspectorField
            id="ov-end"
            label="End Time"
            v-model="editingOverlay.time_end"
            type="time"
            required
            helper-text="When this overlay ends"
            :status="fieldStatus('time_end')"
            @update:model-value="markDirty('overlay')"
          />

          <div class="flex items-center gap-2">
            <input
              id="ov-hard-ticket"
              type="checkbox"
              v-model="editingOverlay.is_hard_ticket"
              class="rounded"
            />
            <label for="ov-hard-ticket" class="text-sm text-secondary">
              Hard Ticket Event
            </label>
          </div>
        </div>

        <div class="pt-4 border-t border-divider">
          <div class="flex gap-2">
            <BaseButtonEnhanced
              variant="primary"
              size="small"
              label="Apply Changes"
              :disabled="!isDirty"
              @click="applyOverlayChanges"
            />
            <BaseButtonEnhanced
              variant="danger"
              size="small"
              label="Delete"
              @click="deleteSelection"
            />
          </div>
        </div>
      </div>

      <!-- Logic Trigger Inspector -->
      <div v-if="selected.type === 'trigger'" class="space-y-4 p-4">
        <div class="space-y-3">
          <InspectorField
            id="trg-type"
            label="Trigger Type"
            v-model="editingTrigger.type"
            type="select"
            :options="[
              { value: 'hard_reset', label: 'Hard Reset' },
              { value: 'sales_window_open', label: 'Sales Window Open' },
              { value: 'sales_window_close', label: 'Sales Window Close' },
              { value: 'doors_open', label: 'Doors Open' },
              { value: 'doors_close', label: 'Doors Close' },
              { value: 'session_start', label: 'Session Start' },
              { value: 'session_end', label: 'Session End' },
              { value: 'jackpot_reset', label: 'Jackpot Reset' },
              { value: 'custom', label: 'Custom' },
            ]"
            required
            helper-text="Determines what action is performed"
            :status="fieldStatus('type')"
            @update:model-value="markDirty('trigger')"
          />

          <!-- Absolute Time Mode -->
          <div v-if="!editingTrigger.isRelative">
            <InspectorField
              id="trg-time"
              label="Trigger Time"
              v-model="editingTrigger.trigger_time"
              type="time"
              required
              helper-text="When this automation fires. Use relative mode to follow an event."
              :status="fieldStatus('trigger_time')"
              @update:model-value="markDirty('trigger')"
            />
          </div>

          <!-- Relative Mode -->
          <div v-else class="space-y-2 p-3 bg-base rounded border border-divider">
            <div class="text-xs font-semibold text-secondary mb-2">Relative Configuration</div>
            
            <InspectorField
              id="trg-anchor-target"
              label="Anchor Event"
              v-model="editingTrigger.relativeAnchor.targetId"
              type="select"
              :options="anchorOptions"
              helper-text="Event to anchor to"
              @update:model-value="markDirty('trigger')"
            />

            <InspectorField
              id="trg-anchor-point"
              label="Anchor Point"
              v-model="editingTrigger.relativeAnchor.anchorPoint"
              type="select"
              :options="[
                { value: 'start', label: 'Start' },
                { value: 'end', label: 'End' },
              ]"
              helper-text="Anchor to start or end of event"
              @update:model-value="markDirty('trigger')"
            />

            <InspectorField
              id="trg-offset"
              label="Offset (minutes)"
              v-model.number="editingTrigger.relativeAnchor.offsetMinutes"
              type="number"
              helper-text="Positive = after, Negative = before"
              @update:model-value="markDirty('trigger')"
            />

            <div class="text-xs text-secondary mt-2">
              Computed Time: <span class="font-mono font-semibold">{{ derivedTime }}</span>
            </div>
          </div>

          <!-- Relative Toggle -->
          <div class="flex items-center gap-2">
            <input
              id="trg-relative"
              type="checkbox"
              v-model="editingTrigger.isRelative"
              class="rounded"
              @change="toggleRelativeMode"
            />
            <label for="trg-relative" class="text-sm text-secondary">
              Use Relative Timing
            </label>
          </div>

          <!-- Target Event (for hard_reset) -->
          <div v-if="editingTrigger.type === 'hard_reset'">
            <InspectorField
              id="trg-target"
              label="Target Event"
              v-model="editingTrigger.target_event"
              type="select"
              :options="overlayOptions"
              helper-text="The event this trigger affects (required for hard reset)"
              :validation-message="!editingTrigger.target_event ? 'Target event is required' : ''"
              @update:model-value="markDirty('trigger')"
            />
          </div>

          <!-- Custom Fields -->
          <div v-if="editingTrigger.type === 'custom'" class="space-y-2">
            <InspectorField
              id="trg-custom-label"
              label="Custom Label"
              v-model="editingTrigger.customLabel"
              type="text"
              helper-text="Descriptive name for this custom trigger"
              @update:model-value="markDirty('trigger')"
            />

            <InspectorField
              id="trg-custom-desc"
              label="Description"
              v-model="editingTrigger.customDescription"
              type="textarea"
              helper-text="What does this trigger do?"
              @update:model-value="markDirty('trigger')"
            />

            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="text-sm font-semibold text-primary">Parameters</label>
                <button
                  class="text-xs text-accent-primary hover:underline"
                  @click="addCustomParam"
                >+ Add Param</button>
              </div>
              
              <div v-if="!editingTrigger.customParams || Object.keys(editingTrigger.customParams).length === 0" class="text-xs text-tertiary py-1">
                No parameters
              </div>
              
              <div v-else class="space-y-1">
                <div
                  v-for="(value, key) in editingTrigger.customParams"
                  :key="key"
                  class="flex items-center gap-1"
                >
                  <input
                    :value="key"
                    @input="updateParamKey(key, $event.target.value)"
                    type="text"
                    placeholder="Key"
                    class="flex-1 px-2 py-1 text-xs border border-divider rounded bg-surface"
                  />
                  <input
                    v-model="editingTrigger.customParams[key]"
                    type="text"
                    placeholder="Value"
                    class="flex-1 px-2 py-1 text-xs border border-divider rounded bg-surface"
                  />
                  <button
                    class="text-xs text-accent-error hover:underline"
                    @click="removeCustomParam(key)"
                  >✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-divider">
          <div class="flex gap-2">
            <BaseButtonEnhanced
              variant="primary"
              size="small"
              label="Apply Changes"
              :disabled="!isDirty"
              @click="applyTriggerChanges"
            />
            <BaseButtonEnhanced
              variant="danger"
              size="small"
              label="Delete"
              @click="deleteSelection"
            />
          </div>
        </div>

        <!-- Dependency Warning -->
        <div v-if="editingTrigger.type === 'hard_reset' && !editingTrigger.target_event" class="pt-2 text-xs text-accent-warning flex items-center gap-1">
          <span>⚠</span> Hard reset requires a target event
        </div>

        <!-- Relative Warning -->
        <div v-if="editingTrigger.isRelative && !editingTrigger.relativeAnchor?.targetId" class="pt-2 text-xs text-accent-warning flex items-center gap-1">
          <span>⚠</span> Relative trigger requires an anchor event
        </div>
      </div>

      <!-- No Selection -->
      <div v-if="!selected" class="p-6 text-center text-sm text-tertiary">
        <p class="mb-2">Select an item to inspect</p>
        <p class="text-xs">Click on a rate card, segment, overlay, or trigger</p>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="border-t border-divider px-4 py-2 text-xs flex items-center justify-between bg-surface">
      <div>
        <span v-if="isDirty" class="text-accent-warning">● Edited</span>
        <span v-else-if="selected" class="text-accent-success">● Saved</span>
        <span v-else class="text-tertiary">● Ready</span>
      </div>
      <div v-if="violations.length" class="text-accent-error">
        {{ violations.length }} issues
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, reactive } from "vue";
import type {
  OpsSchemaRateCard,
  OpsSchemaFlowSegment,
  OpsSchemaOverlayEvent,
  OpsSchemaLogicTrigger,
} from "~/types/ops-schema";

import type { EnhancedLogicTrigger, ConstraintViolation } from "~/types/ops-schema-enhanced";

import { toMinutes, formatMinutes, normalizeTimeRange } from "~/utils/ops-schema.utils";
import { resolveRelativeTriggers } from "~/utils/ops-schema-enhanced.utils";

import InspectorField from "~/components/ui/InspectorField.vue";
import BaseButtonEnhanced from "~/components/ui/BaseButtonEnhanced.vue";

// Props
const props = defineProps<{
  selected: {
    type: "rateCard" | "segment" | "overlay" | "trigger";
    id: string;
  } | null;
  rateCards: OpsSchemaRateCard[];
  flowSegments: OpsSchemaFlowSegment[];
  overlayEvents: OpsSchemaOverlayEvent[];
  logicTriggers: EnhancedLogicTrigger[];
  violations: ConstraintViolation[];
  isDirty: boolean;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  (e: "update-rate-card", card: OpsSchemaRateCard): void;
  (e: "update-segment", segment: OpsSchemaFlowSegment): void;
  (e: "update-overlay", overlay: OpsSchemaOverlayEvent): void;
  (e: "update-trigger", trigger: EnhancedLogicTrigger): void;
  (e: "delete"): void;
  (e: "apply-changes"): void;
}>();

// Editing state
const editingRateCard = ref<OpsSchemaRateCard | null>(null);
const editingSegment = ref<OpsSchemaFlowSegment | null>(null);
const editingOverlay = ref<OpsSchemaOverlayEvent | null>(null);
const editingTrigger = ref<EnhancedLogicTrigger | null>(null);

// Field dirty tracking
const dirtyFields = reactive<Record<string, boolean>>({});

// Computed
const rateCardOptions = computed(() => {
  return props.rateCards.map(card => ({
    value: card.id,
    label: card.name,
  }));
});

const overlayOptions = computed(() => {
  return props.overlayEvents.map(event => ({
    value: event.id,
    label: event.label,
  }));
});

const anchorOptions = computed(() => {
  const options: Array<{ value: string; label: string }> = [];
  
  props.flowSegments.forEach(segment => {
    options.push({
      value: segment.id,
      label: `Flow: ${segment.label}`,
    });
  });
  
  props.overlayEvents.forEach(event => {
    options.push({
      value: event.id,
      label: `Overlay: ${event.label}`,
    });
  });
  
  return options;
});

const derivedTime = computed(() => {
  if (!editingTrigger.value?.isRelative || !editingTrigger.value?.relativeAnchor) {
    return "N/A";
  }

  const resolved = resolveRelativeTriggers(
    [editingTrigger.value],
    props.flowSegments,
    props.overlayEvents
  );

  return resolved[0].derivedTime || "Invalid";
});

const segmentErrors = computed(() => {
  const errors: string[] = [];
  if (!editingSegment.value) return errors;

  const range = normalizeTimeRange(
    editingSegment.value.time_start,
    editingSegment.value.time_end
  );
  const duration = range.end - range.start;

  if (duration < 15) {
    errors.push("Segment must be at least 15 minutes");
  }

  // Check for overlaps
  const otherSegments = props.flowSegments.filter(s => s.id !== editingSegment.value.id);
  const hasOverlap = otherSegments.some(other => {
    const otherRange = normalizeTimeRange(other.time_start, other.time_end);
    return (
      (range.start >= otherRange.start && range.start < otherRange.end) ||
      (range.end > otherRange.start && range.end <= otherRange.end) ||
      (range.start <= otherRange.start && range.end >= otherRange.end)
    );
  });

  if (hasOverlap && !editingSegment.value.allow_overlap) {
    errors.push("Overlaps with another segment");
  }

  return errors;
});

// Methods
const markDirty = (type: "rateCard" | "segment" | "overlay" | "trigger") => {
  // Mark all fields as dirty for simplicity
  // In a real implementation, you'd track individual fields
  emit("apply-changes");
};

const fieldStatus = (field: string): "edited" | "saved" | undefined => {
  if (props.isSaving) return "loading";
  if (props.isDirty) return "edited";
  return undefined;
};

const applyRateCardChanges = () => {
  if (editingRateCard.value) {
    emit("update-rate-card", editingRateCard.value);
  }
};

const applySegmentChanges = () => {
  if (editingSegment.value && segmentErrors.value.length === 0) {
    emit("update-segment", editingSegment.value);
  }
};

const applyOverlayChanges = () => {
  if (editingOverlay.value) {
    emit("update-overlay", editingOverlay.value);
  }
};

const applyTriggerChanges = () => {
  if (editingTrigger.value) {
    emit("update-trigger", editingTrigger.value);
  }
};

const deleteSelection = () => {
  if (confirm("Are you sure you want to delete this item?")) {
    emit("delete");
  }
};

// Rate Card Bundle Management
const addBundle = () => {
  if (!editingRateCard.value) return;
  if (!editingRateCard.value.yield_configuration.active_bundles) {
    editingRateCard.value.yield_configuration.active_bundles = [];
  }
  editingRateCard.value.yield_configuration.active_bundles.push({
    name: "New Bundle",
    discount: 0.1,
  });
  markDirty("rateCard");
};

const removeBundle = (index: number) => {
  if (!editingRateCard.value) return;
  editingRateCard.value.yield_configuration.active_bundles.splice(index, 1);
  markDirty("rateCard");
};

// Custom Trigger Params
const addCustomParam = () => {
  if (!editingTrigger.value) return;
  if (!editingTrigger.value.customParams) {
    editingTrigger.value.customParams = {};
  }
  const key = `param_${Object.keys(editingTrigger.value.customParams).length + 1}`;
  editingTrigger.value.customParams[key] = "";
  markDirty("trigger");
};

const updateParamKey = (oldKey: string, newKey: string) => {
  if (!editingTrigger.value?.customParams) return;
  if (oldKey === newKey) return;

  const value = editingTrigger.value.customParams[oldKey];
  delete editingTrigger.value.customParams[oldKey];
  editingTrigger.value.customParams[newKey] = value;
  markDirty("trigger");
};

const removeCustomParam = (key: string) => {
  if (!editingTrigger.value?.customParams) return;
  delete editingTrigger.value.customParams[key];
  markDirty("trigger");
};

const toggleRelativeMode = () => {
  if (!editingTrigger.value) return;

  if (editingTrigger.value.isRelative) {
    // Initialize relative anchor if not exists
    if (!editingTrigger.value.relativeAnchor) {
      editingTrigger.value.relativeAnchor = {
        targetId: "",
        anchorPoint: "start",
        offsetMinutes: 0,
      };
    }
  } else {
    // Clear relative anchor
    editingTrigger.value.relativeAnchor = undefined;
    // Reset trigger time to current value or operational start
    editingTrigger.value.trigger_time = editingTrigger.value.trigger_time || "09:00";
  }
  markDirty("trigger");
};

// Watchers
watch(
  () => props.selected,
  (newVal) => {
    if (!newVal) {
      editingRateCard.value = null;
      editingSegment.value = null;
      editingOverlay.value = null;
      editingTrigger.value = null;
      return;
    }

    // Deep clone to avoid mutating original until apply
    if (newVal.type === "rateCard") {
      const card = props.rateCards.find(c => c.id === newVal.id);
      editingRateCard.value = card ? JSON.parse(JSON.stringify(card)) : null;
    } else if (newVal.type === "segment") {
      const segment = props.flowSegments.find(s => s.id === newVal.id);
      editingSegment.value = segment ? JSON.parse(JSON.stringify(segment)) : null;
    } else if (newVal.type === "overlay") {
      const event = props.overlayEvents.find(o => o.id === newVal.id);
      editingOverlay.value = event ? JSON.parse(JSON.stringify(event)) : null;
    } else if (newVal.type === "trigger") {
      const trigger = props.logicTriggers.find(t => t.id === newVal.id);
      editingTrigger.value = trigger ? JSON.parse(JSON.stringify(trigger)) : null;
    }

    // Reset dirty fields
    Object.keys(dirtyFields).forEach(key => delete dirtyFields[key]);
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
/* Smooth transitions */
.space-y-4 > * {
  transition: all 0.2s ease;
}

/* Focus states */
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #0A84FF;
  outline-offset: 1px;
}
</style>