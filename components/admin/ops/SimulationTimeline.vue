<template>
  <div class="space-y-4">
    <!-- Controls -->
    <div class="bg-surface border border-divider rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-primary">Playback Controls</h3>
        <div class="flex items-center gap-2">
          <BaseButtonEnhanced
            v-if="!simulationState.isPlaying"
            variant="primary"
            size="small"
            label="▶ Play"
            @click="play"
          />
          <BaseButtonEnhanced
            v-else
            variant="secondary"
            size="small"
            label="⏸ Pause"
            @click="pause"
          />
        </div>
      </div>

      <!-- Speed Controls -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-secondary font-medium">Speed:</span>
        <button
          v-for="speed in [1, 10, 60]"
          :key="speed"
          class="px-3 py-1 text-xs rounded border transition-colors"
          :class="
            simulationState.speed === speed
              ? 'bg-accent-primary text-white border-accent-primary'
              : 'bg-base border-divider text-primary hover:border-accent-primary'
          "
          @click="changeSpeed(speed)"
        >
          {{ speed }}x
        </button>
      </div>

      <!-- Time Display -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-secondary">Current Time:</span>
        <span class="font-mono font-semibold text-primary">{{ currentTimeFormatted }}</span>
      </div>

      <!-- Scrubber -->
      <div class="space-y-1">
        <input
          type="range"
          :min="operationalStartMinutes"
          :max="operationalEndMinutes"
          :value="simulationState.currentTime"
          @input="handleScrub"
          class="w-full h-2 bg-base rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div class="flex justify-between text-xs text-tertiary">
          <span>{{ formatMinutes(operationalStartMinutes) }}</span>
          <span>{{ formatMinutes(operationalEndMinutes) }}</span>
        </div>
      </div>
    </div>

    <!-- Timeline Visualization -->
    <div class="bg-surface border border-divider rounded-lg p-4">
      <h4 class="text-sm font-semibold text-primary mb-3">Timeline</h4>
      
      <div class="relative h-32 bg-base rounded border border-divider overflow-hidden">
        <!-- Operational Range -->
        <div
          class="absolute top-0 bottom-0 bg-accent-success/10"
          :style="{
            left: '0%',
            width: '100%',
          }"
        />

        <!-- Flow Segments -->
        <div
          v-for="segment in schema.timeline.flowSegments"
          :key="segment.id"
          class="absolute top-2 h-8 rounded opacity-60"
          :style="getSegmentStyle(segment)"
        >
          <div class="px-1 text-[10px] text-white font-semibold truncate">
            {{ segment.label }}
          </div>
        </div>

        <!-- Overlay Events -->
        <div
          v-for="event in schema.timeline.overlayEvents"
          :key="event.id"
          class="absolute top-12 h-6 rounded opacity-50 bg-accent-info"
          :style="getEventStyle(event)"
        >
          <div class="px-1 text-[10px] text-white truncate">
            {{ event.label }}
          </div>
        </div>

        <!-- Triggers -->
        <div
          v-for="trigger in schema.logicTriggers"
          :key="trigger.id"
          class="absolute top-20 h-4 rounded-full border-2"
          :class="trigger.type === 'hard_reset' ? 'border-accent-error bg-white' : 'border-accent-warning bg-white'"
          :style="getTriggerStyle(trigger)"
        />

        <!-- Playhead -->
        <div
          class="absolute top-0 bottom-0 border-l-2 border-accent-primary bg-accent-primary/20"
          :style="{ left: playheadPosition + '%' }"
        >
          <div class="absolute -top-6 left-0 -translate-x-1/2 bg-accent-primary text-white text-xs px-2 py-1 rounded">
            {{ currentTimeFormatted }}
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex gap-4 text-xs mt-2">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-blue-500/60 rounded" />
          <span>Flow</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-accent-info/60 rounded" />
          <span>Overlay</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 border-2 border-accent-error rounded-full bg-white" />
          <span>Trigger</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-0.5 h-3 bg-accent-primary" />
          <span>Playhead</span>
        </div>
      </div>
    </div>

    <!-- Events Log -->
    <div class="bg-surface border border-divider rounded-lg p-4">
      <h4 class="text-sm font-semibold text-primary mb-2">Events Log</h4>
      
      <div v-if="simulationState.events.length === 0" class="text-xs text-tertiary py-2">
        No events triggered at this time
      </div>
      
      <div v-else class="space-y-1 max-h-32 overflow-y-auto">
        <div
          v-for="(event, idx) in simulationState.events"
          :key="idx"
          class="text-xs p-2 rounded bg-base border border-divider flex items-center justify-between"
        >
          <span class="font-mono">{{ formatMinutes(event.time) }}</span>
          <span class="font-semibold">{{ event.type }}</span>
          <span class="text-secondary">{{ event.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { EnhancedOpsSchema, SimulationState } from "~/types/ops-schema-enhanced";
import { formatMinutes, normalizeTimeRange, toMinutes } from "~/utils/ops-schema.utils";
import BaseButtonEnhanced from "~/components/ui/BaseButtonEnhanced.vue";

const props = defineProps<{
  schema: EnhancedOpsSchema;
  simulationState: SimulationState;
}>();

const emit = defineEmits<{
  (e: "update-time", time: number): void;
  (e: "play"): void;
  (e: "pause"): void;
  (e: "change-speed", speed: 1 | 10 | 60): void;
}>();

// Computed
const operationalStartMinutes = computed(() => {
  return toMinutes(props.schema.timeline.operationalHours.start);
});

const operationalEndMinutes = computed(() => {
  return toMinutes(props.schema.timeline.operationalHours.end);
});

const currentTimeFormatted = computed(() => {
  return formatMinutes(props.simulationState.currentTime);
});

const playheadPosition = computed(() => {
  const total = operationalEndMinutes.value - operationalStartMinutes.value;
  const current = props.simulationState.currentTime - operationalStartMinutes.value;
  return (current / total) * 100;
});

// Methods
const play = () => {
  emit("play");
};

const pause = () => {
  emit("pause");
};

const changeSpeed = (speed: 1 | 10 | 60) => {
  emit("change-speed", speed);
};

const handleScrub = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update-time", parseFloat(target.value));
};

const getSegmentStyle = (segment: any) => {
  const range = normalizeTimeRange(segment.time_start, segment.time_end);
  const total = operationalEndMinutes.value - operationalStartMinutes.value;
  const left = ((range.start - operationalStartMinutes.value) / total) * 100;
  const width = ((range.end - range.start) / total) * 100;
  
  return {
    left: `${left}%`,
    width: `${width}%`,
    backgroundColor: segment.color_code || "#3b82f6",
  };
};

const getEventStyle = (event: any) => {
  const range = normalizeTimeRange(event.time_start, event.time_end);
  const total = operationalEndMinutes.value - operationalStartMinutes.value;
  const left = ((range.start - operationalStartMinutes.value) / total) * 100;
  const width = ((range.end - range.start) / total) * 100;
  
  return {
    left: `${left}%`,
    width: `${width}%`,
  };
};

const getTriggerStyle = (trigger: any) => {
  const time = toMinutes(trigger.trigger_time);
  const total = operationalEndMinutes.value - operationalStartMinutes.value;
  const left = ((time - operationalStartMinutes.value) / total) * 100;
  
  return {
    left: `${left}%`,
  };
};
</script>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type="range"]::-webkit-slider-track {
  background: #e2e8f0;
  height: 4px;
  border-radius: 2px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #0A84FF;
  cursor: pointer;
  margin-top: -6px;
}

input[type="range"]::-moz-range-track {
  background: #e2e8f0;
  height: 4px;
  border-radius: 2px;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #0A84FF;
  cursor: pointer;
  border: none;
}
</style>