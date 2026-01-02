<template>
  <div
    class="relative h-full flex flex-col rounded-lg border transition-all duration-200 select-none group"
    :class="[
      isSelected
        ? 'ring-2 ring-accent-primary border-accent-primary z-10'
        : 'border-divider hover:border-secondary hover:shadow-sm',
      isEmpty && !ghostProfile ? 'bg-base' : 'bg-surface',
      ghostProfile ? 'opacity-60 border-dashed border-accent-primary' : '',
      viewModeClass,
      isClosed ? 'bg-base opacity-75' : ''
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-2 py-1 border-b border-transparent group-hover:border-divider">
      <span
        class="text-[10px] font-bold uppercase tracking-wider"
        :class="isSelected ? 'text-accent-primary' : 'text-tertiary'"
      >
        {{ dateLabel }}
      </span>
      <!-- Badges/Icons -->
      <div class="flex items-center gap-1">
        <div
          v-if="hasConflict"
          class="w-2 h-2 rounded-full bg-accent-error animate-pulse"
          title="Validation Issue"
        />
        <div
          v-if="isHoliday"
          class="text-[10px] text-accent-warning font-bold"
          title="Holiday"
        >
          HOL
        </div>
        <div
            v-if="isClosed"
            class="text-[10px] text-tertiary font-bold uppercase"
        >
            Closed
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-2 flex flex-col justify-center min-h-[60px]">
      <template v-if="displayProfile">
        <div
          class="text-xs font-bold text-primary line-clamp-2 leading-tight mb-1"
          :style="{ color: displayProfile.color }"
        >
          {{ displayProfile.name }} <span v-if="ghostProfile">(Preview)</span>
        </div>
        
        <!-- Standard View -->
        <div v-if="viewMode === 'standard'" class="flex flex-wrap gap-1">
          <span class="text-[10px] text-secondary bg-base px-1 rounded">
            {{ timeRange }}
          </span>
          <span v-if="projectedRevenue" class="text-[10px] text-accent-success bg-emerald-50 px-1 rounded font-medium">
            ${{ formatMoney(projectedRevenue) }}
          </span>
          <span v-if="staffingStatus === 'short'" class="text-[10px] text-accent-error bg-rose-50 px-1 rounded font-bold" title="Understaffed">
            ! Staff
          </span>
        </div>
        
        <!-- Heatmap View Overlay Info -->
        <div v-if="viewMode === 'heatmap'" class="text-[10px] font-mono text-secondary mt-1">
           <template v-if="projectedRevenue">
             ${{ formatMoney(projectedRevenue) }}
           </template>
           <template v-else>
             -
           </template>
        </div>
        
        <!-- Staffing View Overlay Info -->
        <div v-if="viewMode === 'staffing'" class="text-[10px] font-mono text-secondary mt-1">
           <template v-if="staffingReady">
             Ready
           </template>
           <template v-else-if="staffingStatus === 'short'">
             Short
           </template>
           <template v-else>
             -
           </template>
        </div>
        
      </template>
      <template v-else>
        <!-- Empty State -->
        <div class="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <span class="text-[10px] text-tertiary uppercase tracking-widest font-bold">
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
  isClosed?: boolean;
  hasConflict?: boolean;
  viewMode?: 'standard' | 'heatmap' | 'staffing';
  // Real data props
  projectedRevenue?: number;
  staffingStatus?: 'ok' | 'short' | 'unknown';
  staffingReady?: boolean;
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

const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val);
};

const viewModeClass = computed(() => {
  if (!displayProfile.value) return '';
  
  if (props.viewMode === 'heatmap') {
    if (!props.projectedRevenue) return '';
    const val = props.projectedRevenue;
    // Simple thresholding for now - ideally this would be relative to a max
    if (val > 10000) return '!bg-emerald-100';
    if (val > 5000) return '!bg-emerald-50';
    return '';
  }
  
  if (props.viewMode === 'staffing') {
    if (props.staffingStatus === 'short') return '!bg-rose-50';
    if (props.staffingReady) return '!bg-blue-50';
    return '';
  }
  
  return '';
});
</script>
