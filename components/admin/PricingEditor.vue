<template>
  <div class="h-[calc(100vh-200px)] min-h-[600px] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
        <div>
            <h3 class="text-lg font-black text-primary-900">Pricing Command Center</h3>
            <p class="text-xs text-slate-500">Define rate cards, bundles, and assign them to the daily flow.</p>
        </div>
        <div class="flex items-center gap-2">
            <span v-if="isSaving" class="text-xs font-bold text-slate-400 animate-pulse">SAVING...</span>
            <button
                class="px-4 py-2 bg-primary-900 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-primary-800 transition"
                @click="$emit('save')"
            >
                Deploy Pricing Schema
            </button>
        </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden">
        <!-- LEFT: Library -->
        <div class="w-64 shrink-0 flex flex-col">
            <RateCardLibrary
                :rate-cards="draft.definitions.rateCards"
                :bundles="draft.definitions.bundles"
                :selected-id="selection?.id"
                @select="handleSelect"
                @add-rate-card="addRateCard"
                @add-bundle="addBundle"
            />
        </div>

        <!-- CENTER: Timeline -->
        <div class="flex-1 border-r border-slate-200 flex flex-col min-w-0">
             <TimelineGantt
                :flow-segments="draft.timelineConfiguration.flowSegments"
                :overlay-events="draft.timelineConfiguration.overlayEvents"
                :selected-id="selection?.id"
                @select="handleSelect"
                @add-flow-segment="addFlowSegment"
                @add-overlay-event="addOverlayEvent"
             />
        </div>

        <!-- RIGHT: Inspector -->
        <div class="w-80 shrink-0 bg-white">
            <InspectorPanel
                :item="selectedItem"
                :type="selection?.type"
                :all-rate-cards="draft.definitions.rateCards"
                @update="handleUpdate"
                @delete="handleDelete"
            />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRaw, nextTick } from 'vue';
import type { OpsSchema } from '~/types/ops-schema';
import RateCardLibrary from './pricing/RateCardLibrary.vue';
import TimelineGantt from './pricing/TimelineGantt.vue';
import InspectorPanel from './pricing/InspectorPanel.vue';

const props = defineProps<{
  modelValue: OpsSchema | null;
  isSaving: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

// --- Local Draft Management ---
const isSyncing = ref(false);

const cloneDraft = (value: any): OpsSchema => {
  if (!value || typeof value !== "object") {
    // Return a default empty schema structure if null
    return {
        meta: { name: 'New Schema', status: 'Draft', version: 1, updatedAt: new Date().toISOString() },
        definitions: { rateCards: [], bundles: [], inventoryTiers: [] },
        timelineConfiguration: { flowSegments: [], overlayEvents: [] },
        logicTriggers: [],
        dayProfiles: []
    };
  }
  const rawValue = toRaw(value);
  return JSON.parse(JSON.stringify(rawValue));
};

const draft = ref<OpsSchema>(cloneDraft(props.modelValue));

const syncDraftFromProps = (value: any) => {
  isSyncing.value = true;
  draft.value = cloneDraft(value);
  nextTick(() => {
    isSyncing.value = false;
  });
};

watch(
  () => props.modelValue,
  (value) => {
    // Only sync from props if we are not actively editing (or if it's a remote update)
    // Here we rely on the parent not bouncing back the same object reference constantly.
    // If opsStore.updateOpsSchemaDraft replaces the reference, this fires.
    // We check JSON string equality to avoid unnecessary updates if needed, but deep watch does that.
    syncDraftFromProps(value);
  },
  { deep: true, immediate: true }
);

watch(
  draft,
  (value) => {
    if (!isSyncing.value) {
      emit("update:modelValue", cloneDraft(value));
    }
  },
  { deep: true }
);

// --- Selection Management ---
const selection = ref<{ type: 'rateCard' | 'bundle' | 'flowSegment' | 'overlayEvent', id: string } | null>(null);

const handleSelect = (sel: { type: any, id: string }) => {
    selection.value = sel;
};

const selectedItem = computed(() => {
    if (!selection.value) return null;
    const { type, id } = selection.value;
    if (type === 'rateCard') return draft.value.definitions.rateCards.find(x => x.id === id);
    if (type === 'bundle') return draft.value.definitions.bundles.find(x => x.id === id);
    if (type === 'flowSegment') return draft.value.timelineConfiguration.flowSegments.find(x => x.id === id);
    if (type === 'overlayEvent') return draft.value.timelineConfiguration.overlayEvents.find(x => x.id === id);
    return null;
});

// --- Actions ---

const generateId = (prefix: string) => `${prefix}-${Date.now()}`;

const addRateCard = () => {
    const id = generateId('rc');
    draft.value.definitions.rateCards.push({
        id,
        name: 'New Rate Card',
        basePrice: 0,
        category: 'Regular'
    });
    handleSelect({ type: 'rateCard', id });
};

const addBundle = () => {
    const id = generateId('bn');
    draft.value.definitions.bundles.push({
        id,
        name: 'New Bundle',
        price: 0,
        rateCardIds: []
    });
    handleSelect({ type: 'bundle', id });
};

const addFlowSegment = () => {
    const id = generateId('fs');
    draft.value.timelineConfiguration.flowSegments.push({
        id,
        name: 'New Segment',
        startTime: '10:00',
        endTime: '12:00'
    });
    handleSelect({ type: 'flowSegment', id });
};

const addOverlayEvent = () => {
    const id = generateId('oe');
    draft.value.timelineConfiguration.overlayEvents.push({
        id,
        name: 'New Event',
        startTime: '19:00',
        endTime: '19:30'
    });
    handleSelect({ type: 'overlayEvent', id });
};

const handleUpdate = ({ type, data }: { type: string, data: any }) => {
    // Update the item in the draft
    if (type === 'rateCard') {
        const idx = draft.value.definitions.rateCards.findIndex(x => x.id === data.id);
        if (idx !== -1) draft.value.definitions.rateCards[idx] = data;
    } else if (type === 'bundle') {
        const idx = draft.value.definitions.bundles.findIndex(x => x.id === data.id);
        if (idx !== -1) draft.value.definitions.bundles[idx] = data;
    } else if (type === 'flowSegment') {
        const idx = draft.value.timelineConfiguration.flowSegments.findIndex(x => x.id === data.id);
        if (idx !== -1) draft.value.timelineConfiguration.flowSegments[idx] = data;
    } else if (type === 'overlayEvent') {
        const idx = draft.value.timelineConfiguration.overlayEvents.findIndex(x => x.id === data.id);
        if (idx !== -1) draft.value.timelineConfiguration.overlayEvents[idx] = data;
    }
    // draft watcher will emit update
};

const handleDelete = ({ type, id }: { type: string, id: string }) => {
    if (confirm('Are you sure you want to delete this item?')) {
        if (type === 'rateCard') {
            draft.value.definitions.rateCards = draft.value.definitions.rateCards.filter(x => x.id !== id);
        } else if (type === 'bundle') {
            draft.value.definitions.bundles = draft.value.definitions.bundles.filter(x => x.id !== id);
        } else if (type === 'flowSegment') {
            draft.value.timelineConfiguration.flowSegments = draft.value.timelineConfiguration.flowSegments.filter(x => x.id !== id);
        } else if (type === 'overlayEvent') {
             draft.value.timelineConfiguration.overlayEvents = draft.value.timelineConfiguration.overlayEvents.filter(x => x.id !== id);
        }
        selection.value = null;
    }
};

</script>
