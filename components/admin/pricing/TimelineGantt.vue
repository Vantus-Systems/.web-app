<template>
  <div class="h-full flex flex-col bg-slate-50 relative overflow-hidden">
    <!-- Timeline Header (Time Scale) -->
    <div
      class="h-10 bg-white border-b border-slate-200 flex sticky top-0 z-10 shrink-0"
    >
      <div class="w-20 border-r border-slate-200 shrink-0 bg-slate-50"></div>
      <!-- Sidebar spacer -->
      <div ref="timelineHeader" class="flex-1 relative overflow-hidden">
        <div
          v-for="hour in hours"
          :key="hour"
          class="absolute top-0 bottom-0 border-l border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 select-none"
          :style="{ left: `${getPercent(hour * 60)}%` }"
        >
          {{ formatHour(hour) }}
        </div>
      </div>
    </div>

    <!-- Timeline Body -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden relative">
      <!-- Grid Lines -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          v-for="hour in hours"
          :key="hour"
          class="absolute top-0 bottom-0 border-l border-slate-200/50 border-dashed"
          :style="{ left: `${getPercent(hour * 60 + 120)}%` }"
        ></div>
        <!-- +120px offset approx if needed, but here we use % relative to container.
                  Wait, the header has a w-20 spacer. The body needs to match.
             -->
      </div>

      <div class="flex h-full">
        <!-- Labels Column -->
        <div
          class="w-20 border-r border-slate-200 bg-white shrink-0 flex flex-col pt-4"
        >
          <div
            class="h-12 flex items-center justify-end px-2 text-[10px] font-bold uppercase text-slate-400"
          >
            Flow
          </div>
          <div
            class="h-12 flex items-center justify-end px-2 text-[10px] font-bold uppercase text-slate-400 mt-2"
          >
            Events
          </div>
        </div>

        <!-- Tracks Area -->
        <div ref="tracksArea" class="flex-1 relative pt-4">
          <!-- Flow Track -->
          <div class="h-12 relative w-full mb-2">
            <div
              class="absolute inset-0 bg-slate-100/50 mx-2 rounded-lg border border-slate-200/50"
            ></div>
            <div
              v-for="segment in flowSegments"
              :key="segment.id"
              class="absolute top-1 bottom-1 rounded bg-blue-100 border border-blue-200 hover:bg-blue-200 cursor-pointer transition-colors group flex items-center justify-center overflow-hidden px-1"
              :class="
                selectedId === segment.id
                  ? '!bg-blue-300 !border-blue-500 ring-2 ring-blue-500/30'
                  : ''
              "
              :style="getSegmentStyle(segment)"
              @click="emit('select', { type: 'flowSegment', id: segment.id })"
            >
              <span class="text-[10px] font-bold text-blue-700 truncate">{{
                segment.name
              }}</span>
            </div>
          </div>

          <!-- Events Track -->
          <div class="h-12 relative w-full mt-2">
            <div
              class="absolute inset-0 bg-slate-100/50 mx-2 rounded-lg border border-slate-200/50"
            ></div>
            <div
              v-for="event in overlayEvents"
              :key="event.id"
              class="absolute top-1 bottom-1 rounded bg-purple-100 border border-purple-200 hover:bg-purple-200 cursor-pointer transition-colors group flex items-center justify-center overflow-hidden px-1"
              :class="
                selectedId === event.id
                  ? '!bg-purple-300 !border-purple-500 ring-2 ring-purple-500/30'
                  : ''
              "
              :style="getSegmentStyle(event)"
              @click="$emit('select', { type: 'overlayEvent', id: event.id })"
            >
              <span class="text-[10px] font-bold text-purple-700 truncate">{{
                event.name
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend / Tools -->
    <div
      class="h-12 bg-white border-t border-slate-200 flex items-center px-4 justify-between shrink-0"
    >
      <div class="flex items-center gap-4 text-xs text-slate-500">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          Flow Segments
        </div>
        <div class="flex items-center gap-1">
          <div
            class="w-3 h-3 bg-purple-100 border border-purple-200 rounded"
          ></div>
          Overlays
        </div>
      </div>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 text-xs font-bold uppercase bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
          @click="$emit('addFlowSegment')"
        >
          + Segment
        </button>
        <button
          class="px-3 py-1 text-xs font-bold uppercase bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
          @click="$emit('addOverlayEvent')"
        >
          + Event
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Local lightweight types (ops-schema doesn't export these in some builds)
type FlowSegment = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  [key: string]: any;
};

type OverlayEvent = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  [key: string]: any;
};

const { flowSegments, overlayEvents, selectedId } = defineProps<{
  flowSegments: FlowSegment[];
  overlayEvents: OverlayEvent[];
  selectedId?: string;
}>();

const emit = defineEmits(["select", "addFlowSegment", "addOverlayEvent"]);

// Config: Day starts at 8:00 (480 min), ends at 02:00 next day (26h = 1560 min)
// Total range = 1560 - 480 = 1080 minutes
const START_MIN = 8 * 60; // 08:00
const END_MIN = 26 * 60; // 02:00 (next day)
const TOTAL_MIN = END_MIN - START_MIN;

const hours = computed(() => {
  const list = [];
  for (let i = 8; i <= 26; i++) {
    list.push(i);
  }
  return list;
});

const formatHour = (h: number) => {
  const adjusted = h >= 24 ? h - 24 : h;
  const ampm = adjusted >= 12 ? "PM" : "AM";
  const dispH = adjusted > 12 ? adjusted - 12 : adjusted === 0 ? 12 : adjusted;
  return `${dispH} ${ampm}`;
};

const parseTime = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  let total = h * 60 + m;
  // If time is earlier than the start (e.g. 01:00), treat it as next day
  if (total < START_MIN) total += 24 * 60;
  return total;
};

const getPercent = (minutes: number) => {
  return ((minutes - START_MIN) / TOTAL_MIN) * 100;
};

const getSegmentStyle = (seg: FlowSegment | OverlayEvent) => {
  const start = parseTime(seg.startTime);
  const end = parseTime(seg.endTime);
  const duration = end - start;

  const left = getPercent(start);
  const width = (duration / TOTAL_MIN) * 100;

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
};
</script>
