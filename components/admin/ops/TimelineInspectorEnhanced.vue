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
          </div>
          
          <div v-if="!availableBundles || availableBundles.length === 0" class="text-xs text-tertiary py-2">
            No bundles defined in schema.
          </div>
          
          <div v-else class="space-y-1 max-h-48 overflow-y-auto border border-divider rounded bg-surface p-1">
            <label
              v-for="bundle in availableBundles"
              :key="bundle.id"
              class="flex items-start gap-2 p-2 rounded hover:bg-base cursor-pointer transition-colors"
              :class="editingRateCard.yield_configuration.active_bundles.includes(bundle.id) ? 'bg-accent-primary/5' : ''"
            >
              <input
                type="checkbox"
                :value="bundle.id"
                v-model="editingRateCard.yield_configuration.active_bundles"
                @change="markDirty('rateCard')"
                class="mt-0.5 rounded border-secondary text-accent-primary focus:ring-accent-primary"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-primary">{{ bundle.name }}</span>
                  <span class="text-xs text-secondary font-mono">${{ bundle.price }}</span>
                </div>
                <div class="text-[10px] text-secondary truncate">
                  {{ bundle.items.length }} items • {{ bundle.discount_label || 'No discount' }}
                </div>
              </div>
            </label>
          </div>
          
          <div class="mt-2 text-xs text-secondary flex justify-between">
            <span>{{ editingRateCard.yield_configuration.active_bundles.length }} selected</span>
            <span class="italic">Select bundles to enable for this rate</span>
          </div>
        </div>

        <div class="pt-4 border-t border-divider">
          <div class="flex gap-2">
            <BaseButtonEnhanced
              variant="primary"
              size="small"
              label="Apply Changes"
              :disabled="!localIsDirty"
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
              :disabled="!localIsDirty"
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
              :disabled="!localIsDirty"
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
      <div v-if="selected.type === 'trigger'" class="flex flex-col h-full">
        <!-- Header -->
        <div class="p-4 border-b border-divider bg-base">
          <div class="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Configuration</div>
          <h3 class="text-lg font-bold text-primary">
            {{ getTriggerLabel(editingTrigger.type) }}
          </h3>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <!-- Step 1: Trigger Type -->
          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold text-primary">Trigger Type</label>
              <span class="text-xs text-secondary bg-surface px-2 py-1 rounded border border-divider">Step 1</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="typeDef in triggerTypeDefinitions"
                :key="typeDef.value"
                class="flex flex-col items-start p-3 rounded border text-left transition-all hover:shadow-sm"
                :class="editingTrigger.type === typeDef.value 
                  ? 'border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary' 
                  : 'border-divider bg-surface hover:border-accent-primary/50'"
                @click="updateTriggerType(typeDef.value)"
              >
                <span class="text-xs font-semibold mb-1" :class="editingTrigger.type === typeDef.value ? 'text-accent-primary' : 'text-primary'">
                  {{ typeDef.label }}
                </span>
                <span class="text-[10px] text-secondary leading-tight">
                  {{ typeDef.description }}
                </span>
              </button>
            </div>
          </section>

          <!-- Step 2: Timing -->
          <section class="space-y-3 pt-4 border-t border-divider">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold text-primary">Timing</label>
              <span class="text-xs text-secondary bg-surface px-2 py-1 rounded border border-divider">Step 2</span>
            </div>

            <!-- Mode Toggle -->
            <div class="flex bg-surface p-1 rounded-lg border border-divider">
              <button
                class="flex-1 py-1.5 text-xs font-medium rounded transition-colors"
                :class="!editingTrigger.isRelative ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'"
                @click="setRelativeMode(false)"
              >
                Absolute Time
              </button>
              <button
                class="flex-1 py-1.5 text-xs font-medium rounded transition-colors"
                :class="editingTrigger.isRelative ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'"
                @click="setRelativeMode(true)"
              >
                Relative to Event
              </button>
            </div>

            <!-- Absolute Input -->
            <div v-if="!editingTrigger.isRelative" class="animate-in fade-in slide-in-from-top-1">
              <InspectorField
                id="trg-time"
                label="Trigger Time"
                v-model="editingTrigger.trigger_time"
                type="time"
                required
                helper-text="Exact time when this trigger fires"
                :status="fieldStatus('trigger_time')"
                @update:model-value="markDirty('trigger')"
              />
            </div>

            <!-- Relative Input -->
            <div v-else class="space-y-3 animate-in fade-in slide-in-from-top-1">
              <InspectorField
                id="trg-anchor-target"
                label="Anchor Event"
                v-model="editingTrigger.relativeAnchor.targetId"
                type="select"
                :options="anchorOptions"
                helper-text="Which event controls this trigger?"
                @update:model-value="markDirty('trigger')"
              />

              <div class="grid grid-cols-2 gap-3">
                <InspectorField
                  id="trg-anchor-point"
                  label="Anchor Point"
                  v-model="editingTrigger.relativeAnchor.anchorPoint"
                  type="select"
                  :options="[
                    { value: 'start', label: 'Start of Event' },
                    { value: 'end', label: 'End of Event' },
                  ]"
                  @update:model-value="markDirty('trigger')"
                />

                <InspectorField
                  id="trg-offset"
                  label="Offset (mins)"
                  v-model.number="editingTrigger.relativeAnchor.offsetMinutes"
                  type="number"
                  helper-text="- for before, + for after"
                  @update:model-value="markDirty('trigger')"
                />
              </div>

              <div class="p-2 bg-accent-info/5 rounded border border-accent-info/20 text-xs text-secondary flex justify-between items-center">
                <span>Calculated Time:</span>
                <span class="font-mono font-bold text-primary">{{ derivedTime }}</span>
              </div>
            </div>
          </section>

          <!-- Step 3: Action Details -->
          <section class="space-y-3 pt-4 border-t border-divider">
            <div class="flex items-center justify-between">
              <label class="text-sm font-semibold text-primary">Action Details</label>
              <span class="text-xs text-secondary bg-surface px-2 py-1 rounded border border-divider">Step 3</span>
            </div>

            <!-- Hard Reset Specific -->
            <div v-if="editingTrigger.type === 'hard_reset'" class="space-y-3">
              <div class="p-3 bg-accent-warning/5 rounded border border-accent-warning/20 text-xs text-secondary">
                <strong class="text-accent-warning block mb-1">⚠ State Reset (Hard Reset)</strong>
                This trigger completely resets the timeline state. It is used to clear all previous segments/overlays and start a new event sequence (e.g. switching from Matinee to Evening session).
                You MUST select a Target Event to define the starting point of the new state.
              </div>
              
              <InspectorField
                id="trg-target"
                label="Target Overlay Event"
                v-model="editingTrigger.target_event"
                type="select"
                :options="overlayOptions"
                helper-text="Select the event that defines the new state"
                required
                :validation-message="!editingTrigger.target_event ? 'Target event is required' : ''"
                @update:model-value="markDirty('trigger')"
              />
              
              <div class="flex justify-end">
                <button 
                  class="text-xs text-accent-primary hover:underline flex items-center gap-1"
                  @click="createAndLinkOverlay"
                >
                  <span>+ Create new Overlay Event</span>
                </button>
              </div>
            </div>

            <!-- Custom Specific -->
            <div v-if="editingTrigger.type === 'custom'" class="space-y-3">
              <InspectorField
                id="trg-custom-label"
                label="Label"
                v-model="editingTrigger.customLabel"
                type="text"
                placeholder="e.g. 'Notify Manager'"
                @update:model-value="markDirty('trigger')"
              />
              
              <InspectorField
                id="trg-custom-desc"
                label="Description"
                v-model="editingTrigger.customDescription"
                type="textarea"
                placeholder="Describe what this custom trigger does..."
                @update:model-value="markDirty('trigger')"
              />

              <!-- Parameters -->
               <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-secondary">Parameters</span>
                  <button
                    class="text-xs text-accent-primary hover:underline"
                    @click="addCustomParam"
                  >+ Add</button>
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

            <!-- Default info for other types -->
            <div v-if="!['hard_reset', 'custom'].includes(editingTrigger.type)" class="text-xs text-secondary italic">
              No additional configuration required for {{ getTriggerLabel(editingTrigger.type) }}.
            </div>
          </section>
        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-divider bg-base flex gap-2">
          <BaseButtonEnhanced
            variant="primary"
            size="small"
            label="Save Changes"
            class="flex-1"
            :disabled="!localIsDirty"
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

      <!-- No Selection / Validation Summary -->
      <div v-if="!selected" class="flex flex-col h-full">
        <div class="p-6 text-center border-b border-divider">
          <div class="text-secondary mb-2">
            <LayoutDashboard class="w-12 h-12 mx-auto opacity-20" />
          </div>
          <h3 class="text-lg font-semibold text-primary mb-1">Inspector</h3>
          <p class="text-sm text-tertiary">Select an item on the timeline to edit its properties.</p>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="violations.length > 0" class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold text-primary flex items-center gap-2">
                <AlertCircle class="w-4 h-4 text-accent-error" />
                Validation Issues
              </h4>
              <span class="text-xs font-mono bg-accent-error/10 text-accent-error px-2 py-0.5 rounded-full">
                {{ violations.length }}
              </span>
            </div>

            <div class="space-y-2">
              <div
                v-for="(violation, index) in violations"
                :key="index"
                class="p-3 rounded border border-l-4 cursor-pointer transition-all hover:shadow-md"
                :class="[
                  violation.severity === 'error' 
                    ? 'bg-accent-error/5 border-accent-error/20 border-l-accent-error' 
                    : 'bg-accent-warning/5 border-accent-warning/20 border-l-accent-warning'
                ]"
                @click="emit('select', violation.entityType, violation.entityId)"
              >
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs font-bold uppercase tracking-wider" 
                    :class="violation.severity === 'error' ? 'text-accent-error' : 'text-accent-warning'">
                    {{ violation.severity }}
                  </span>
                  <span class="text-[10px] text-tertiary uppercase">{{ violation.entityType }}</span>
                </div>
                <p class="text-sm text-primary mt-1 font-medium">{{ violation.message }}</p>
                <p class="text-xs text-secondary mt-1">
                  {{ formatMinutes(violation.time) }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-tertiary">
             <CheckCircle class="w-8 h-8 mx-auto mb-2 opacity-20 text-accent-success" />
             <p class="text-sm">No validation issues found.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="border-t border-divider px-4 py-2 text-xs flex items-center justify-between bg-surface">
      <div>
        <span v-if="localIsDirty" class="text-accent-warning">● Edited</span>
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
import { LayoutDashboard, AlertCircle, CheckCircle } from 'lucide-vue-next';
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
  (e: "create-linked-overlay", triggerId: string, name: string): void;
  (e: "delete"): void;
  (e: "apply-changes"): void;
}>();

// Editing state
const editingRateCard = ref<OpsSchemaRateCard | null>(null);
const editingSegment = ref<OpsSchemaFlowSegment | null>(null);
const editingOverlay = ref<OpsSchemaOverlayEvent | null>(null);
const editingTrigger = ref<EnhancedLogicTrigger | null>(null);

// Trigger Definitions
const triggerTypeDefinitions = [
  { value: "hard_reset", label: "State Reset", description: "Clear all state & start new event" },
  { value: "sales_window_open", label: "Open Sales", description: "Allow sales to begin" },
  { value: "sales_window_close", label: "Close Sales", description: "Stop all sales" },
  { value: "doors_open", label: "Doors Open", description: "Open venue doors" },
  { value: "doors_close", label: "Doors Close", description: "Close venue doors" },
  { value: "session_start", label: "Session Start", description: "Begin gaming session" },
  { value: "session_end", label: "Session End", description: "End gaming session" },
  { value: "jackpot_reset", label: "Jackpot Reset", description: "Reset progressive values" },
  { value: "custom", label: "Custom", description: "User-defined action" },
];

const getTriggerLabel = (type: string) => {
  const def = triggerTypeDefinitions.find(d => d.value === type);
  return def ? def.label : type.replace(/_/g, " ");
};

const updateTriggerType = (type: string) => {
  if (editingTrigger.value) {
    editingTrigger.value.type = type as any;
    markDirty("trigger");
  }
};

const setRelativeMode = (isRelative: boolean) => {
  if (editingTrigger.value) {
    editingTrigger.value.isRelative = isRelative;
    if (isRelative && !editingTrigger.value.relativeAnchor) {
      // Default anchor
      editingTrigger.value.relativeAnchor = {
        targetId: props.flowSegments[0]?.id || "",
        anchorPoint: "start",
        offsetMinutes: 0
      };
    }
    markDirty("trigger");
  }
};

const createAndLinkOverlay = () => {
  if (!editingTrigger.value) return;
  
  const name = prompt("Enter name for new overlay event:");
  if (name) {
    emit("create-linked-overlay", editingTrigger.value.id, name);
  }
};

// Field dirty tracking
const dirtyFields = reactive<Record<string, boolean>>({});
const localIsDirty = ref(false);

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
  localIsDirty.value = true;
};

const fieldStatus = (field: string): "edited" | "saved" | undefined => {
  if (props.isSaving) return "loading";
  if (localIsDirty.value) return "edited";
  return undefined;
};

const applyRateCardChanges = () => {
  if (editingRateCard.value) {
    emit("update-rate-card", editingRateCard.value);
    localIsDirty.value = false;
  }
};

const applySegmentChanges = () => {
  if (editingSegment.value && segmentErrors.value.length === 0) {
    emit("update-segment", editingSegment.value);
    localIsDirty.value = false;
  }
};

const applyOverlayChanges = () => {
  if (editingOverlay.value) {
    emit("update-overlay", editingOverlay.value);
    localIsDirty.value = false;
  }
};

const applyTriggerChanges = () => {
  if (editingTrigger.value) {
    emit("update-trigger", editingTrigger.value);
    localIsDirty.value = false;
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
  { immediate: true }
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