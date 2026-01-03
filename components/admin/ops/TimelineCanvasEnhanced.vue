<template>
  <div class="h-full flex flex-col bg-base overflow-hidden">
    <!-- Time Ruler (Sticky Top) -->
    <div class="bg-surface border-b border-divider flex-shrink-0">
      <div class="flex">
        <!-- Lane Labels -->
        <div class="w-24 flex-shrink-0 border-r border-divider bg-surface sticky left-0 z-20">
          <div class="h-12 flex items-center justify-center text-xs font-bold text-secondary border-b border-divider">
            FLOW
          </div>
          <div class="h-12 flex items-center justify-center text-xs font-bold text-secondary border-b border-divider">
            OVER
          </div>
          <div class="h-12 flex items-center justify-center text-xs font-bold text-secondary">
            TRIG
          </div>
        </div>

        <!-- Time Scale -->
        <div class="flex-1 overflow-hidden relative" ref="rulerRef">
          <div class="flex h-full" :style="{ width: totalWidth + 'px' }">
            <div
              v-for="hour in timeScale"
              :key="hour.label"
              class="flex-shrink-0 border-r border-divider relative"
              :style="{ width: hour.width + 'px' }"
            >
              <div class="h-full flex items-center justify-center text-xs text-secondary font-mono">
                {{ hour.label }}
              </div>
              <!-- Minor ticks -->
              <div class="absolute bottom-0 left-0 right-0 h-1/2 border-t border-divider opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="flex-1 overflow-auto relative" ref="canvasContainerRef">
      <div
        class="flex min-h-full"
        @dragover.prevent="handleDragOver"
        @drop="handleDrop"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
      >
        <!-- Lane Labels (Pinned Left) -->
        <div class="w-24 flex-shrink-0 border-r border-divider bg-surface sticky left-0 z-20">
          <!-- Flow Lane Label -->
          <div class="h-12 flex items-center justify-between px-2 border-b border-divider">
            <span class="text-xs font-bold text-secondary">FLOW</span>
            <button
              class="text-xs text-accent-primary hover:bg-base rounded px-1"
              @click="quickAddSegment"
              title="Add Flow Segment"
            >+</button>
          </div>
          <!-- Overlay Lane Label -->
          <div class="h-12 flex items-center justify-between px-2 border-b border-divider">
            <span class="text-xs font-bold text-secondary">OVER</span>
            <button
              class="text-xs text-accent-primary hover:bg-base rounded px-1"
              @click="quickAddOverlay"
              title="Add Overlay"
            >+</button>
          </div>
          <!-- Trigger Lane Label -->
          <div class="h-12 flex items-center justify-between px-2">
            <span class="text-xs font-bold text-secondary">TRIG</span>
            <button
              class="text-xs text-accent-primary hover:bg-base rounded px-1"
              @click="quickAddTrigger"
              title="Add Trigger"
            >+</button>
          </div>
        </div>

        <!-- Main Canvas -->
        <div class="flex-1 relative" ref="canvasRef" :style="{ minWidth: totalWidth + 'px' }">
          <!-- Grid Lines -->
          <div v-if="showGrid" class="absolute inset-0 pointer-events-none">
            <div
              v-for="line in gridLines"
              :key="line.left"
              class="absolute top-0 bottom-0 border-r opacity-20"
              :class="line.isMajor ? 'border-secondary' : 'border-tertiary'"
              :style="{ left: line.left + 'px' }"
            />
          </div>

          <!-- Heatmap Overlay -->
          <div v-if="showHeatmap" class="absolute inset-0 pointer-events-none">
            <div
              v-for="range in heatmapRanges"
              :key="range.start + '-' + range.end"
              class="absolute h-full opacity-20"
              :class="{
                'bg-accent-warning': range.density === 'high',
                'bg-accent-info': range.density === 'medium',
              }"
              :style="{
                left: range.left + 'px',
                width: range.width + 'px',
              }"
            />
          </div>

          <!-- Snap Guide Lines -->
          <div v-if="snapGuide.show" class="absolute inset-0 pointer-events-none z-30">
            <div
              class="absolute top-0 bottom-0 border-l-2 border-accent-primary"
              :style="{ left: snapGuide.left + 'px' }"
            />
          </div>

          <!-- Flow Lane -->
          <div class="relative h-12 border-b border-divider">
            <div
              v-for="segment in flowSegments"
              :key="segment.id"
              class="absolute top-2 h-8 rounded-md border cursor-pointer transition-all hover:shadow-sm group text-white"
              :class="[
                selectedId === segment.id && selectedType === 'segment'
                  ? 'border-accent-primary ring-2 ring-accent-primary/20'
                  : 'border-divider hover:border-accent-primary',
                showGaps && hasGapAround(segment) ? 'border-l-accent-error border-r-accent-error' : '',
              ]"
              :style="{
                left: getSegmentLeft(segment) + 'px',
                width: getSegmentWidth(segment) + 'px',
                backgroundColor: segment.color_code || '#64748b',
              }"
              @click="selectItem('segment', segment.id)"
              @mousedown="startDrag('segment', segment.id, $event)"
            >
              <!-- Content -->
              <div class="px-2 h-full flex items-center justify-between overflow-hidden">
                <span
                  v-if="showLabels"
                  class="text-xs font-semibold truncate"
                >{{ getSegmentLabel(segment) }}</span>
                
                <!-- Resize Handles -->
                <div
                  v-if="selectedId === segment.id"
                  class="absolute inset-y-0 left-0 w-2 cursor-ew-resize hover:bg-white/20"
                  @mousedown.stop="startResize('segment', segment.id, 'start', $event)"
                />
                <div
                  v-if="selectedId === segment.id"
                  class="absolute inset-y-0 right-0 w-2 cursor-ew-resize hover:bg-white/20"
                  @mousedown.stop="startResize('segment', segment.id, 'end', $event)"
                />
              </div>

              <!-- Tooltip -->
              <div
                v-if="showTooltip(segment.id)"
                class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-divider rounded px-2 py-1 text-xs text-primary shadow-lg z-40 whitespace-nowrap"
              >
                {{ segment.label }}<br />
                {{ segment.time_start }} - {{ segment.time_end }}
              </div>
            </div>
          </div>

          <!-- Overlay Lane -->
          <div class="relative h-12 border-b border-divider">
            <div
              v-for="event in overlayEvents"
              :key="event.id"
              class="absolute top-2 h-8 rounded border cursor-pointer transition-all hover:shadow-sm"
              :class="[
                selectedId === event.id && selectedType === 'overlay'
                  ? 'border-accent-primary ring-2 ring-accent-primary/20'
                  : 'border-divider hover:border-accent-primary bg-accent-info/10',
              ]"
              :style="{
                left: getEventLeft(event) + 'px',
                width: getEventWidth(event) + 'px',
              }"
              @click="selectItem('overlay', event.id)"
              @mousedown="startDrag('overlay', event.id, $event)"
            >
              <div class="px-2 h-full flex items-center justify-center overflow-hidden">
                <span
                  v-if="showLabels"
                  class="text-xs font-semibold text-primary truncate"
                >{{ event.label }}</span>
              </div>
            </div>
          </div>

          <!-- Trigger Lane -->
          <div class="relative h-12">
            <div
              v-for="trigger in logicTriggers"
              :key="trigger.id"
              class="absolute top-2 h-8 flex items-center cursor-pointer transition-all"
              @click="selectItem('trigger', trigger.id)"
              @mousedown="startDrag('trigger', trigger.id, $event)"
            >
              <!-- Trigger Marker -->
              <div
                class="w-3 h-3 rounded-full border-2 transition-all hover:scale-125"
                :class="[
                  selectedId === trigger.id && selectedType === 'trigger'
                    ? 'border-accent-primary bg-accent-primary'
                    : 'border-accent-error bg-white',
                  trigger.isRelative ? 'border-dashed' : '',
                ]"
                :style="{ left: getTriggerLeft(trigger) + 'px' }"
              />

              <!-- Trigger Label -->
              <div
                v-if="showLabels"
                class="ml-1 text-xs font-medium text-secondary truncate"
                :style="{ left: getTriggerLeft(trigger) + 'px' }"
              >
                {{ trigger.customLabel || trigger.type.replace('_', ' ') }}
              </div>

              <!-- Dependency Line -->
              <svg
                v-if="trigger.target_event || (trigger.isRelative && trigger.relativeAnchor)"
                class="absolute top-4 left-0 w-full h-4 pointer-events-none text-accent-primary"
                :style="{ left: getTriggerLeft(trigger) + 'px' }"
              >
                <line
                  x1="0"
                  y1="0"
                  :x2="getDependencyLineEnd(trigger)"
                  y2="4"
                  stroke="currentColor"
                  stroke-width="1"
                  stroke-dasharray="2,2"
                  opacity="0.5"
                />
              </svg>

              <!-- Tooltip -->
              <div
                v-if="showTooltip(trigger.id)"
                class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-divider rounded px-2 py-1 text-xs text-primary shadow-lg z-40 whitespace-nowrap"
              >
                {{ trigger.customLabel || trigger.type }}<br />
                Time: {{ trigger.trigger_time }}
                <span v-if="trigger.isRelative"> (Relative)</span>
              </div>
            </div>
          </div>

          <!-- Operational Hours Indicator -->
          <div
            class="absolute top-0 bottom-0 border-l-2 border-r-2 border-accent-success/30 pointer-events-none"
            :style="{
              left: operationalStartLeft + 'px',
              width: operationalWidth + 'px',
            }"
          />

          <!-- Dragging Indicator -->
          <div
            v-if="dragState.isDragging"
            class="absolute top-0 bottom-0 border-l-2 border-accent-primary z-50 pointer-events-none"
            :style="{ left: dragState.currentX + 'px' }"
          />
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="bg-surface border-t border-divider px-3 py-2 text-xs flex items-center justify-between">
      <div class="flex items-center gap-4">
        <span class="text-secondary">
          Zoom: <span class="font-semibold">{{ density }}</span>
        </span>
        <span class="text-secondary">
          Snap: <span class="font-semibold">{{ snapIncrement }}m</span>
        </span>
        <span v-if="violations.length" class="text-accent-error">
          Issues: {{ violations.length }}
        </span>
      </div>
      <div class="text-tertiary">
        {{ flowSegments.length }} segments • {{ overlayEvents.length }} overlays • {{ logicTriggers.length }} triggers
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onBeforeUnmount } from "vue";
import type {
  OpsSchemaFlowSegment,
  OpsSchemaOverlayEvent,
  OpsSchemaLogicTrigger,
  OpsSchemaRateCard,
} from "~/types/ops-schema";

import type { EnhancedLogicTrigger, RippleOptions, ConstraintViolation } from "~/types/ops-schema-enhanced";

import {
  calculateScrollAwareX,
  enhancedSnapMinutes,
} from "~/utils/ops-schema-enhanced.utils";

import { toMinutes, formatMinutes, normalizeTimeRange, toOperationalMinutes, normalizeRangeToOperational } from "~/utils/ops-schema.utils";

// Props
const props = defineProps<{
  flowSegments: OpsSchemaFlowSegment[];
  overlayEvents: OpsSchemaOverlayEvent[];
  logicTriggers: EnhancedLogicTrigger[];
  rateCards: OpsSchemaRateCard[];
  operationalStart: string;
  operationalEnd: string;
  density: "compact" | "standard" | "detail";
  selectedId?: string;
  selectedType?: "rateCard" | "segment" | "overlay" | "trigger";
  showGaps: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showHeatmap: boolean;
  activeTool: "standard" | "ripple" | "knife";
  rippleOptions: RippleOptions;
  snapIncrement: number;
  programs: { id: string; name: string }[];
  violations: ConstraintViolation[];
}>();

const emit = defineEmits<{
  (e: "select", type: "rateCard" | "segment" | "overlay" | "trigger", id: string): void;
  (e: "add-segment", payload: { rateCardId: string; time_start: string; time_end: string }): void;
  (e: "update-segment", payload: { id: string; time_start: string; time_end: string }): void;
  (e: "update-overlay", payload: { id: string; time_start: string; time_end: string }): void;
  (e: "update-trigger", payload: { id: string; trigger_time: string }): void;
  (e: "split-segment", payload: { id: string; time: string }): void;
  (e: "error", message: string): void;
  (e: "zoom", delta: number): void;
}>();

// Refs
const canvasRef = ref<HTMLElement | null>(null);
const canvasContainerRef = ref<HTMLElement | null>(null);
const rulerRef = ref<HTMLElement | null>(null);

// State
const dragState = reactive({
  isDragging: false,
  type: null as "segment" | "overlay" | "trigger" | null,
  id: null as string | null,
  startX: 0,
  currentX: 0,
  originalStart: null as string | null,
  originalEnd: null as string | null,
  resizeHandle: null as "start" | "end" | null,
});

const snapGuide = reactive({
  show: false,
  left: 0,
});

const hoveredId = ref<string | null>(null);

// Density Scale (pixels per minute)
const densityScale = computed(() => {
  const scales = {
    compact: 1.5,  // 1.5px per minute
    standard: 2.5, // 2.5px per minute
    detail: 4,     // 4px per minute
  };
  return scales[props.density];
});

// Time Range
const operationalRange = computed(() => {
  return normalizeRangeToOperational(props.operationalStart, props.operationalEnd, props.operationalStart);
});

const totalWidth = computed(() => {
  return operationalRange.value.duration * densityScale.value;
});

// Time Scale for Ruler
const timeScale = computed(() => {
  const range = operationalRange.value;
  const hours = Math.ceil(range.duration / 60);
  const widthPerHour = (60 * densityScale.value);

  return Array.from({ length: hours }, (_, i) => {
    // Calculate the actual hour based on operational start
    const startHour = Math.floor(toMinutes(props.operationalStart) / 60);
    const currentHour = (startHour + i) % 24;
    const label = `${currentHour.toString().padStart(2, '0')}:00`;
    return { label, width: widthPerHour };
  });
});

// Grid Lines
const gridLines = computed(() => {
  const lines: Array<{ left: number; isMajor: boolean }> = [];
  const range = operationalRange.value;
  
  // Major lines every hour, minor every snap increment
  const snapMinutes = props.snapIncrement;
  const totalMinutes = range.duration;
  
  for (let minute = 0; minute <= totalMinutes; minute += snapMinutes) {
    const left = minute * densityScale.value;
    const isMajor = minute % 60 === 0;
    lines.push({ left, isMajor });
  }
  
  return lines;
});

// Heatmap Ranges
const heatmapRanges = computed(() => {
  const ranges: Array<{ start: number; end: number; left: number; width: number; density: "high" | "medium" }> = [];
  
  // Find high traffic periods (overlaps)
  props.overlayEvents.forEach(overlay => {
    const overlayRange = normalizeRangeToOperational(overlay.time_start, overlay.time_end, props.operationalStart);
    
    props.flowSegments.forEach(segment => {
      const segmentRange = normalizeRangeToOperational(segment.time_start, segment.time_end, props.operationalStart);
      
      const overlapStart = Math.max(overlayRange.start, segmentRange.start);
      const overlapEnd = Math.min(overlayRange.end, segmentRange.end);
      
      if (overlapStart < overlapEnd) {
        const left = (overlapStart - operationalRange.value.start) * densityScale.value; // operationalRange.start is 0 usually in relative terms, but let's be safe
        // Actually operationalRange.start from normalizeRangeToOperational is 0 if we passed operationalStart as the 3rd arg.
        // Let's check logic: normalizeRangeToOperational returns absolute minutes from 0-based operational timeline.
        // Yes, so overlapStart is already the offset from operationalStart.
        
        const width = (overlapEnd - overlapStart) * densityScale.value;
        ranges.push({
          start: overlapStart,
          end: overlapEnd,
          left: overlapStart * densityScale.value,
          width,
          density: "high",
        });
      }
    });
  });
  
  return ranges;
});

// Operational Hours Visual
const operationalStartLeft = computed(() => {
  return 0;
});

const operationalWidth = computed(() => {
  return operationalRange.value.duration * densityScale.value;
});

const isEmpty = computed(() => {
  return props.flowSegments.length === 0 && props.overlayEvents.length === 0 && props.logicTriggers.length === 0;
});

// Methods

const getSegmentLabel = (segment: OpsSchemaFlowSegment) => {
  if (segment.program_id) {
    const program = props.programs.find(p => p.id === segment.program_id);
    if (program) return `${segment.label} (${program.name})`;
  }
  return segment.label;
};

const getSegmentLeft = (segment: OpsSchemaFlowSegment): number => {
  const range = normalizeRangeToOperational(segment.time_start, segment.time_end, props.operationalStart);
  return range.start * densityScale.value;
};

const getSegmentWidth = (segment: OpsSchemaFlowSegment): number => {
  const range = normalizeRangeToOperational(segment.time_start, segment.time_end, props.operationalStart);
  return range.duration * densityScale.value;
};

const getEventLeft = (event: OpsSchemaOverlayEvent): number => {
  const start = toOperationalMinutes(event.time_start, props.operationalStart);
  return start * densityScale.value;
};

const getEventWidth = (event: OpsSchemaOverlayEvent): number => {
  const range = normalizeRangeToOperational(event.time_start, event.time_end, props.operationalStart);
  return range.duration * densityScale.value;
};

const getTriggerLeft = (trigger: EnhancedLogicTrigger): number => {
  const time = toOperationalMinutes(trigger.trigger_time, props.operationalStart);
  return time * densityScale.value;
};

const getDependencyLineEnd = (trigger: EnhancedLogicTrigger): number => {
  // Calculate distance to target
  if (trigger.target_event) {
    const target = props.overlayEvents.find(o => o.id === trigger.target_event);
    if (target) {
      const targetLeft = getEventLeft(target);
      const triggerLeft = getTriggerLeft(trigger);
      return targetLeft - triggerLeft;
    }
  }
  
  if (trigger.isRelative && trigger.relativeAnchor) {
    const target = props.flowSegments.find(s => s.id === trigger.relativeAnchor.targetId) ||
                   props.overlayEvents.find(o => o.id === trigger.relativeAnchor.targetId);
    if (target) {
      const anchorTime = trigger.relativeAnchor.anchorPoint === "start"
        ? toOperationalMinutes(target.time_start, props.operationalStart)
        : toOperationalMinutes(target.time_end, props.operationalStart);
      const anchorLeft = anchorTime * densityScale.value;
      const triggerLeft = getTriggerLeft(trigger);
      return anchorLeft - triggerLeft;
    }
  }
  
  return 20; // Default small line
};

const hasGapAround = (segment: OpsSchemaFlowSegment): boolean => {
  const range = normalizeRangeToOperational(segment.time_start, segment.time_end, props.operationalStart);
  
  // Check if there's a gap before this segment
  const segments = props.flowSegments
    .map(s => normalizeRangeToOperational(s.time_start, s.time_end, props.operationalStart))
    .sort((a, b) => a.start - b.start);
  
  const index = segments.findIndex(s => s.start === range.start && s.end === range.end);
  
  if (index > 0) {
    const prev = segments[index - 1];
    if (prev.end < range.start) return true;
  }
  
  // Check if there's a gap after this segment
  if (index < segments.length - 1) {
    const next = segments[index + 1];
    if (range.end < next.start) return true;
  }
  
  // Check against operational hours
  // operationalRange.start is 0 in operational minutes
  if (range.start > 0 && index === 0) return true;
  if (range.end < operationalRange.value.duration && index === segments.length - 1) return true;
  
  return false;
};

const showTooltip = (id: string): boolean => {
  return hoveredId.value === id;
};

// Selection
const selectItem = (type: "segment" | "overlay" | "trigger", id: string) => {
  emit("select", type, id);
};

// Quick Add
const quickAddSegment = () => {
  emit("error", "Drag a rate card from the library to add a segment");
};

const quickAddOverlay = () => {
  const start = operationalRange.value.start + 60; // 1 hour in
  const end = operationalRange.value.end - 60; // 1 hour before end
  emit("add-segment", {
    rateCardId: "temp", // Will be handled by parent
    time_start: formatMinutes(start),
    time_end: formatMinutes(end),
  });
};

const quickAddTrigger = () => {
  emit("error", "Use the + Trigger button in the toolbar");
};

// Drag & Drop
const handleDragOver = (event: DragEvent) => {
  const data = event.dataTransfer?.getData("application/x-ops-ratecard");
  if (data) {
    event.dataTransfer.dropEffect = "copy";
  }
};

const handleDrop = (event: DragEvent) => {
  const data = event.dataTransfer?.getData("application/x-ops-ratecard");
  if (!data || !canvasRef.value) return;

  const { id: rateCardId } = JSON.parse(data);
  const rect = canvasRef.value.getBoundingClientRect();
  
  // Calculate time from drop position (accounting for scroll)
  const scrollLeft = canvasContainerRef.value?.scrollLeft || 0;
  const x = event.clientX - rect.left + scrollLeft;
  
  const minutes = operationalRange.value.start + (x / densityScale.value);
  const snapped = enhancedSnapMinutes(minutes, {
    gridIncrement: props.snapIncrement,
    anchorSnapEnabled: true,
    anchorThreshold: 10,
    showGuideLines: true,
  }, getAnchorPoints());

  // Default duration: 1 hour
  const duration = 60;
  const endTime = snapped + duration;

  emit("add-segment", {
    rateCardId,
    time_start: formatMinutes(snapped),
    time_end: formatMinutes(endTime),
  });
};

// Mouse Dragging
const startDrag = (
  type: "segment" | "overlay" | "trigger",
  id: string,
  event: MouseEvent
) => {
  if (props.activeTool === "knife") {
    // Knife tool: split at click position
    handleKnifeClick(type, id, event);
    return;
  }

  const item = findItem(type, id);
  if (!item || !canvasRef.value) return;

  dragState.isDragging = true;
  dragState.type = type;
  dragState.id = id;
  dragState.startX = event.clientX;
  dragState.currentX = event.clientX;

  if (type === "segment") {
    dragState.originalStart = item.time_start;
    dragState.originalEnd = item.time_end;
  } else if (type === "overlay") {
    dragState.originalStart = item.time_start;
    dragState.originalEnd = item.time_end;
  } else if (type === "trigger") {
    dragState.originalStart = item.trigger_time;
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!dragState.isDragging || !canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const scrollLeft = canvasContainerRef.value?.scrollLeft || 0;
  
  // Calculate current X position (accounting for scroll)
  const currentX = event.clientX - rect.left + scrollLeft;
  dragState.currentX = currentX;

  // Calculate time delta
  const deltaX = event.clientX - dragState.startX;
  const deltaMinutes = deltaX / densityScale.value;

  // Show snap guide
  if (props.snapSettings?.showGuideLines) {
    const snappedTime = enhancedSnapMinutes(
      operationalRange.value.start + (currentX / densityScale.value),
      {
        gridIncrement: props.snapIncrement,
        anchorSnapEnabled: true,
        anchorThreshold: 10,
        showGuideLines: true,
      },
      getAnchorPoints()
    );
    snapGuide.left = (snappedTime - operationalRange.value.start) * densityScale.value;
    snapGuide.show = true;
  }

  // Update item in real-time (visual feedback)
  // Note: Actual update happens on mouse up
};

const handleMouseUp = (event: MouseEvent) => {
  if (!dragState.isDragging || !canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const scrollLeft = canvasContainerRef.value?.scrollLeft || 0;
  const finalX = event.clientX - rect.left + scrollLeft;
  
  const deltaX = event.clientX - dragState.startX;
  const deltaMinutes = deltaX / densityScale.value;

  // Snap final position
  const finalTime = operationalRange.value.start + (finalX / densityScale.value);
  const snappedTime = enhancedSnapMinutes(
    finalTime,
    {
      gridIncrement: props.snapIncrement,
      anchorSnapEnabled: true,
      anchorThreshold: 10,
      showGuideLines: true,
    },
    getAnchorPoints()
  );

  if (dragState.type === "segment" && dragState.originalStart && dragState.originalEnd) {
    const originalStart = toMinutes(dragState.originalStart);
    const originalEnd = toMinutes(dragState.originalEnd);
    const duration = originalEnd - originalStart;
    
    if (dragState.resizeHandle === "start") {
      const newStart = snappedTime;
      const newEnd = newStart + duration;
      emit("update-segment", {
        id: dragState.id!,
        time_start: formatMinutes(newStart),
        time_end: formatMinutes(newEnd),
      });
    } else if (dragState.resizeHandle === "end") {
      const newEnd = snappedTime;
      emit("update-segment", {
        id: dragState.id!,
        time_start: dragState.originalStart,
        time_end: formatMinutes(newEnd),
      });
    } else {
      // Move entire segment
      const newStart = snappedTime;
      const newEnd = newStart + duration;
      emit("update-segment", {
        id: dragState.id!,
        time_start: formatMinutes(newStart),
        time_end: formatMinutes(newEnd),
      });
    }
  } else if (dragState.type === "overlay" && dragState.originalStart && dragState.originalEnd) {
    const originalStart = toMinutes(dragState.originalStart);
    const originalEnd = toMinutes(dragState.originalEnd);
    const duration = originalEnd - originalStart;
    const newStart = snappedTime;
    const newEnd = newStart + duration;
    
    // Emit update overlay event
    emit("update-overlay", {
      id: dragState.id!,
      time_start: formatMinutes(newStart),
      time_end: formatMinutes(newEnd),
    });
  } else if (dragState.type === "trigger" && dragState.originalStart) {
    // Update trigger time
    const trigger = props.logicTriggers.find(t => t.id === dragState.id);
    if (trigger) {
      // Emit update trigger event
      emit("update-trigger", {
        id: dragState.id!,
        trigger_time: formatMinutes(snappedTime),
      });
    }
  }

  // Reset state
  dragState.isDragging = false;
  dragState.type = null;
  dragState.id = null;
  dragState.resizeHandle = null;
  dragState.originalStart = null;
  dragState.originalEnd = null;
  snapGuide.show = false;
};

const handleMouseLeave = () => {
  if (dragState.isDragging) {
    handleMouseUp(new MouseEvent("mouseup"));
  }
  snapGuide.show = false;
};

// Resize
const startResize = (
  type: "segment",
  id: string,
  handle: "start" | "end",
  event: MouseEvent
) => {
  event.stopPropagation();
  dragState.resizeHandle = handle;
  startDrag(type, id, event);
};

// Knife Tool
const handleKnifeClick = (
  type: "segment" | "overlay" | "trigger",
  id: string,
  event: MouseEvent
) => {
  if (type !== "segment") {
    emit("error", "Knife tool only works on flow segments");
    return;
  }

  if (!canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  const scrollLeft = canvasContainerRef.value?.scrollLeft || 0;
  const x = event.clientX - rect.left + scrollLeft;
  
  const minutes = operationalRange.value.start + (x / densityScale.value);
  const snapped = enhancedSnapMinutes(minutes, {
    gridIncrement: props.snapIncrement,
    anchorSnapEnabled: true,
    anchorThreshold: 10,
    showGuideLines: true,
  }, getAnchorPoints());

  emit("split-segment", {
    id,
    time: formatMinutes(snapped),
  });
};

// Helper: Find item
const findItem = (type: "segment" | "overlay" | "trigger", id: string) => {
  if (type === "segment") return props.flowSegments.find(s => s.id === id);
  if (type === "overlay") return props.overlayEvents.find(o => o.id === id);
  if (type === "trigger") return props.logicTriggers.find(t => t.id === id);
};

// Helper: Get anchor points for snapping
const getAnchorPoints = (): number[] => {
  const points: number[] = [];
  
  // Add segment start/end points
  props.flowSegments.forEach(segment => {
    const range = normalizeTimeRange(segment.time_start, segment.time_end);
    points.push(range.start, range.end);
  });
  
  // Add overlay start/end points
  props.overlayEvents.forEach(event => {
    const range = normalizeTimeRange(event.time_start, event.time_end);
    points.push(range.start, range.end);
  });
  
  // Add trigger times
  props.logicTriggers.forEach(trigger => {
    points.push(toMinutes(trigger.trigger_time));
  });
  
  // Add operational boundaries
  points.push(operationalRange.value.start, operationalRange.value.end);
  
  return points;
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.selectedId || !props.selectedType) return;

  const step = event.shiftKey ? 5 : props.snapIncrement;
  let handled = false;

  if (event.key === "ArrowLeft") {
    // Nudge left
    nudgeSelection(-step);
    handled = true;
  } else if (event.key === "ArrowRight") {
    // Nudge right
    nudgeSelection(step);
    handled = true;
  } else if (event.key === "Delete") {
    // Delete selection
    emit("select", props.selectedType, props.selectedId); // Parent handles deletion
    handled = true;
  } else if (event.key === "Escape") {
    // Clear selection
    emit("select", "segment", ""); // Clear selection
    handled = true;
  }

  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
};

const nudgeSelection = (minutes: number) => {
  if (!props.selectedId || !props.selectedType) return;

  const item = findItem(props.selectedType, props.selectedId);
  if (!item) return;

  if (props.selectedType === "segment") {
    const range = normalizeTimeRange(item.time_start, item.time_end);
    const duration = range.end - range.start;
    const newStart = range.start + minutes;
    const newEnd = newStart + duration;
    
    emit("update-segment", {
      id: props.selectedId,
      time_start: formatMinutes(newStart),
      time_end: formatMinutes(newEnd),
    });
  } else if (props.selectedType === "trigger") {
    const time = toMinutes(item.trigger_time);
    const newTime = time + minutes;
    
    // Would need to emit update trigger
    emit("error", "Trigger nudging not yet implemented");
  }
};

// Hover handling
const handleMouseEnter = (id: string) => {
  hoveredId.value = id;
};

const handleMouseLeaveItem = () => {
  hoveredId.value = null;
};

// Lifecycle
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
/* Smooth transitions */
.absolute {
  transition: all 0.1s ease-out;
}

/* Cursor styles */
.cursor-ew-resize {
  cursor: ew-resize;
}

/* Tooltip animation */
.group:hover .tooltip {
  opacity: 1;
  transform: translateY(0);
}
</style>