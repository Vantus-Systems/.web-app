<template>
  <div
    class="relative h-full flex flex-col rounded-lg border transition-all duration-200 select-none group"
    :class="[
      isSelected
        ? 'ring-2 ring-primary-500 border-primary-500 z-10'
        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
      isEmpty && !ghostProfile ? 'bg-slate-50' : 'bg-white',
      ghostProfile ? 'opacity-60 border-dashed border-primary-300' : '',
      viewModeClass
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-2 py-1 border-b border-transparent group-hover:border-slate-100">
      <span
        class="text-[10px] font-bold uppercase tracking-wider"
        :class="isSelected ? 'text-primary-700' : 'text-slate-400'"
      >
        {{ dateLabel }}
      </span>
      <!-- Badges/Icons -->
      <div class="flex items-center gap-1">
        <div
          v-if="hasConflict"
          class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
          title="Validation Issue"
        />
        <div
          v-if="isHoliday"
          class="text-[10px] text-amber-600 font-bold"
          title="Holiday"
        >
          HOL
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-2 flex flex-col justify-center min-h-[60px]">
      <template v-if="displayProfile">
        <div
          class="text-xs font-bold text-slate-900 line-clamp-2 leading-tight mb-1"
          :style="{ color: displayProfile.color }"
        >
          {{ displayProfile.name }} <span v-if="ghostProfile">(Preview)</span>
        </div>
        
        <!-- Standard View -->
        <div v-if="viewMode === 'standard'" class="flex flex-wrap gap-1">
          <span class="text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
            {{ timeRange }}
          </span>
          <span v-if="revenueDisplay" class="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-medium">
            ${{ revenueDisplay }}
          </span>
        </div>
        
        <!-- Heatmap View Overlay Info -->
        <div v-if="viewMode === 'heatmap'" class="text-[10px] font-mono text-slate-600 mt-1">
           Rev: ${{ revenueDisplay }}
        </div>
        
        <!-- Staffing View Overlay Info -->
        <div v-if="viewMode === 'staffing'" class="text-[10px] font-mono text-slate-600 mt-1">
           Cov: {{ coverageDisplay }}%
        </div>
        
      </template>
      <template v-else>
        <!-- Empty State -->
        <div class="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <!-- Subtle hatch pattern or icon could go here -->
           <span class="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
             Open
           </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  profile?: {
    name: string;
    color?: string;
    operationalHours?: { start: string; end: string };
  };
  ghostProfile?: {
    name: string;
    color?: string;
    operationalHours?: { start: string; end: string };
  };
  isSelected?: boolean;
  isHoliday?: boolean;
  hasConflict?: boolean;
  viewMode?: 'standard' | 'heatmap' | 'staffing';
}>();

const dateLabel = computed(() => {
  const dayNum = props.date.split('-')[2];
  return `${props.dayOfWeek} ${dayNum}`;
});

const displayProfile = computed(() => props.ghostProfile || props.profile);
const isEmpty = computed(() => !displayProfile.value);

const timeRange = computed(() => {
  if (!displayProfile.value?.operationalHours) return "";
  return `${displayProfile.value.operationalHours.start}-${displayProfile.value.operationalHours.end}`;
});

// Mock Data Generators for Visualization
const revenueDisplay = computed(() => {
  if (!displayProfile.value) return 0;
  // Deterministic mock based on date
  const seed = props.date.charCodeAt(props.date.length - 1) + props.date.charCodeAt(props.date.length - 2);
  return (seed * 100) + 5000;
});

const coverageDisplay = computed(() => {
  if (!displayProfile.value) return 0;
  const seed = props.date.charCodeAt(props.date.length - 1);
  return Math.min(100, Math.max(60, seed));
});

const viewModeClass = computed(() => {
  if (!displayProfile.value) return '';
  
  if (props.viewMode === 'heatmap') {
    const val = revenueDisplay.value;
    if (val > 12000) return '!bg-emerald-100';
    if (val > 10000) return '!bg-emerald-50';
    return '';
  }
  
  if (props.viewMode === 'staffing') {
    const val = coverageDisplay.value;
    if (val < 70) return '!bg-rose-50';
    if (val < 85) return '!bg-amber-50';
    return '!bg-blue-50';
  }
  
  return '';
});
</script>
