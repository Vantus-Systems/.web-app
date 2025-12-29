<template>
  <div class="h-full flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
    <div class="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
      <div class="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
        Operations Canvas
      </div>
      <div class="text-xs text-slate-500">
        {{ operationalLabel }}
      </div>
    </div>
    <div class="relative flex-1 overflow-hidden">
      <div
        ref="canvasRef"
        class="absolute inset-0 overflow-auto"
        @dragover.prevent
        @drop="handleDrop"
        @wheel="handleWheel"
      >
        <div
          class="relative h-full"
          :style="{ width: `${canvasWidth}px` }"
        >
          <div class="absolute inset-0 bg-slate-50">
            <div
              v-for="(line, idx) in gridLines"
              :key="`grid-${idx}`"
              class="absolute top-0 bottom-0"
              :class="line.isHour ? 'border-l border-slate-300' : 'border-l border-slate-200'"
              :style="{ left: `${line.x}px` }"
            ></div>
            <div
              v-for="gap in gaps"
              :key="`gap-${gap.start}-${gap.end}`"
              class="absolute top-0 bottom-0 bg-amber-100/60"
              :style="{ left: `${minutesToX(gap.start)}px`, width: `${minutesToX(gap.end) - minutesToX(gap.start)}px` }"
            ></div>
          </div>

          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="(line, idx) in hourLabels"
              :key="`label-${idx}`"
              class="absolute top-2 text-[10px] text-slate-400 font-bold"
              :style="{ left: `${line.x + 4}px` }"
            >
              {{ line.label }}
            </div>
          </div>

          <div class="relative h-full pt-10 space-y-6">
            <div class="relative h-16">
              <div class="absolute inset-0 rounded-xl bg-emerald-50 border border-emerald-100"></div>
              <div class="absolute inset-0 flex items-center justify-center text-xs text-emerald-700 font-bold">
                Operational Status (Open)
              </div>
            </div>

            <div class="relative h-24">
              <div class="absolute inset-0 rounded-xl bg-white border border-slate-200"></div>
              <div
                v-for="segment in flowSegments"
                :key="segment.id"
                class="absolute top-2 bottom-2 rounded-lg border shadow-sm cursor-pointer"
                :class="segment.id === selectedId && selectedType === 'segment'
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-slate-200'"
                :style="segmentStyle(segment)"
                @click="emitSelect('segment', segment.id)"
              >
                <div class="absolute inset-0 rounded-lg bg-white/70"></div>
                <div class="relative h-full flex items-center justify-between px-2 text-xs font-bold text-slate-800">
                  <span class="truncate">{{ segment.label }}</span>
                  <span class="text-[10px] text-slate-500">{{ segment.time_start }}–{{ segment.time_end }}</span>
                </div>
                <div
                  class="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize"
                  @mousedown.prevent="startResize(segment, 'start', $event)"
                ></div>
                <div
                  class="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize"
                  @mousedown.prevent="startResize(segment, 'end', $event)"
                ></div>
              </div>
            </div>

            <div class="relative h-20">
              <div class="absolute inset-0 rounded-xl bg-white border border-slate-200"></div>
              <div
                v-for="event in overlayEvents"
                :key="event.id"
                class="absolute top-3 bottom-3 rounded-lg border border-slate-200 bg-slate-100/70 cursor-pointer px-2 flex items-center text-xs font-semibold text-slate-700"
                :style="overlayStyle(event)"
                @click="emitSelect('overlay', event.id)"
              >
                {{ event.label }}
              </div>
            </div>

            <div class="relative h-12">
              <div class="absolute inset-0 rounded-xl bg-white border border-slate-200"></div>
              <div
                v-for="trigger in logicTriggers"
                :key="trigger.id"
                class="absolute top-1/2 -translate-y-1/2 cursor-pointer"
                :style="{ left: `${minutesToX(toMinutes(trigger.trigger_time))}px` }"
                @click="emitSelect('trigger', trigger.id)"
              >
                <div class="w-3 h-3 bg-amber-400 rotate-45 border border-amber-600"></div>
              </div>
            </div>
          </div>

          <div class="absolute bottom-2 left-2 right-2 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full bg-slate-400/60 rounded-full" :style="{ width: `${minimapWidth}px` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import type {
  OpsSchemaFlowSegment,
  OpsSchemaLogicTrigger,
  OpsSchemaOverlayEvent,
  OpsSchemaRateCard,
} from "~/types/ops-schema";
import {
  formatMinutes,
  normalizeTimeRange,
  snapMinutes,
  toMinutes,
} from "~/utils/ops-schema.utils";

const props = defineProps<{
  flowSegments: OpsSchemaFlowSegment[];
  overlayEvents: OpsSchemaOverlayEvent[];
  logicTriggers: OpsSchemaLogicTrigger[];
  rateCards: OpsSchemaRateCard[];
  operationalStart: string;
  operationalEnd: string;
  density: "compact" | "standard" | "detail";
  selectedId?: string | null;
  selectedType?: "segment" | "overlay" | "trigger" | null;
  gaps: Array<{ start: number; end: number }>;
}>();

const emit = defineEmits<{
  (e: "select", payload: { type: "segment" | "overlay" | "trigger"; id: string }): void;
  (e: "add-segment", payload: { rateCardId: string; time_start: string; time_end: string }): void;
  (e: "update-segment", payload: { id: string; time_start: string; time_end: string }): void;
  (e: "error", message: string): void;
  (e: "zoom", delta: number): void;
}>();

const canvasRef = ref<HTMLElement | null>(null);

const densityScale = computed(() => {
  if (props.density === "detail") return 4;
  if (props.density === "standard") return 2;
  return 1;
});

const snapIncrement = computed(() => {
  if (props.density === "detail") return 15;
  if (props.density === "standard") return 30;
  return 60;
});

const operationalRange = computed(() =>
  normalizeTimeRange(props.operationalStart, props.operationalEnd),
);

const canvasWidth = computed(
  () => (operationalRange.value.end - operationalRange.value.start) * densityScale.value,
);

const operationalLabel = computed(
  () => `${props.operationalStart} → ${props.operationalEnd}`,
);

const minutesToX = (minutes: number) =>
  (minutes - operationalRange.value.start) * densityScale.value;

const gridLines = computed(() => {
  const lines: Array<{ x: number; isHour: boolean }> = [];
  const start = operationalRange.value.start;
  const end = operationalRange.value.end;
  for (let minutes = start; minutes <= end; minutes += 30) {
    lines.push({
      x: minutesToX(minutes),
      isHour: minutes % 60 === 0,
    });
  }
  return lines;
});

const hourLabels = computed(() => {
  const labels: Array<{ x: number; label: string }> = [];
  const start = operationalRange.value.start;
  const end = operationalRange.value.end;
  for (let minutes = start; minutes <= end; minutes += 60) {
    labels.push({
      x: minutesToX(minutes),
      label: formatMinutes(minutes),
    });
  }
  return labels;
});

const segmentStyle = (segment: OpsSchemaFlowSegment) => {
  const range = normalizeTimeRange(segment.time_start, segment.time_end);
  return {
    left: `${minutesToX(range.start)}px`,
    width: `${minutesToX(range.end) - minutesToX(range.start)}px`,
    backgroundColor: segment.color_code || "#f8fafc",
  };
};

const overlayStyle = (event: OpsSchemaOverlayEvent) => {
  const range = normalizeTimeRange(event.time_start, event.time_end);
  return {
    left: `${minutesToX(range.start)}px`,
    width: `${minutesToX(range.end) - minutesToX(range.start)}px`,
  };
};

const emitSelect = (type: "segment" | "overlay" | "trigger", id: string) => {
  emit("select", { type, id });
};

const handleDrop = (event: DragEvent) => {
  if (!canvasRef.value) return;
  const data = event.dataTransfer?.getData("application/x-ops-ratecard");
  if (!data) return;
  const payload = JSON.parse(data);
  const rect = canvasRef.value.getBoundingClientRect();
  const rawMinutes =
    operationalRange.value.start +
    (event.clientX - rect.left) / densityScale.value;
  const snappedStart = snapMinutes(rawMinutes, snapIncrement.value);
  const snappedEnd = snappedStart + 60;
  if (
    snappedStart < operationalRange.value.start ||
    snappedEnd > operationalRange.value.end
  ) {
    emit("error", "Segment must fit within operational hours.");
    return;
  }
  emit("add-segment", {
    rateCardId: payload.id,
    time_start: formatMinutes(snappedStart),
    time_end: formatMinutes(snappedEnd),
  });
};

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    emit("zoom", event.deltaY);
  }
};

const minimapWidth = computed(() => {
  if (!canvasRef.value) return 120;
  const visible = canvasRef.value.clientWidth || 1;
  return Math.min(visible / 4, canvasWidth.value);
});

type ResizeMode = "start" | "end";
const resizeState = ref<{
  id: string;
  mode: ResizeMode;
} | null>(null);

const startResize = (
  segment: OpsSchemaFlowSegment,
  mode: ResizeMode,
  event: MouseEvent,
) => {
  resizeState.value = { id: segment.id, mode };
  window.addEventListener("mousemove", handleResizeMove);
  window.addEventListener("mouseup", stopResize);
  event.stopPropagation();
};

const handleResizeMove = (event: MouseEvent) => {
  if (!resizeState.value || !canvasRef.value) return;
  const segment = props.flowSegments.find((item) => item.id === resizeState.value?.id);
  if (!segment) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const rawMinutes =
    operationalRange.value.start +
    (event.clientX - rect.left) / densityScale.value;
  const snapped = snapMinutes(rawMinutes, snapIncrement.value);
  const range = normalizeTimeRange(segment.time_start, segment.time_end);
  let nextStart = range.start;
  let nextEnd = range.end;
  if (resizeState.value.mode === "start") {
    nextStart = Math.min(snapped, range.end - snapIncrement.value);
  } else {
    nextEnd = Math.max(snapped, range.start + snapIncrement.value);
  }
  if (nextStart < operationalRange.value.start || nextEnd > operationalRange.value.end) {
    return;
  }
  emit("update-segment", {
    id: segment.id,
    time_start: formatMinutes(nextStart),
    time_end: formatMinutes(nextEnd),
  });
};

const stopResize = () => {
  resizeState.value = null;
  window.removeEventListener("mousemove", handleResizeMove);
  window.removeEventListener("mouseup", stopResize);
};

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleResizeMove);
  window.removeEventListener("mouseup", stopResize);
});
</script>
