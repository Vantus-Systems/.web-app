<template>
  <div
    class="relative h-full flex flex-col transition-all duration-200 select-none group border-b border-r border-divider p-1"
    :class="[
      isSelected
        ? 'bg-accent-primary/10 ring-inset ring-2 ring-accent-primary z-10'
        : 'hover:bg-surface-dark/5',
      isClosed ? 'bg-base/50 pattern-diagonal-lines' : 'bg-surface',
      ghostProfile ? 'opacity-60 border-dashed border-accent-primary' : ''
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-1 mb-1">
      <span
        class="text-[10px] font-bold"
        :class="[
          isSelected ? 'text-accent-primary' : 'text-secondary',
          isToday ? 'bg-accent-primary text-white px-1.5 rounded-full' : ''
        ]"
      >
        {{ dayNumber }}
      </span>
      
      <!-- Icons -->
      <div class="flex items-center gap-1">
        <div v-if="hasConflict" class="text-accent-warning animate-pulse" title="Schedule Conflict">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div v-if="isLocked" class="text-tertiary">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div
          v-if="isHoliday"
          class="flex items-center justify-center w-3 h-3 rounded-full bg-accent-warning text-[8px] font-bold text-black cursor-help"
          :title="holidayInfo?.name"
        >
          H
        </div>
        <div
          v-if="assignment.source === 'default' && !assignment.overrideReasons?.length"
          class="w-1 h-1 rounded-full bg-tertiary/30"
          title="Default Schedule"
        />
        <div
          v-if="assignment.overrideReasons?.length"
          class="w-1.5 h-1.5 rounded-full bg-accent-info"
          :title="'Overridden: ' + assignment.overrideReasons.join(', ')"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center min-h-[50px] relative overflow-hidden">
      <!-- Closed State -->
      <div v-if="isClosed" class="flex items-center justify-center h-full">
        <span class="text-[10px] font-bold text-tertiary uppercase tracking-widest rotate-[-15deg]">
          Closed
        </span>
      </div>

      <!-- Active Profile -->
      <template v-else-if="displayProfile">
        <div
          class="text-xs font-bold leading-tight mb-1 truncate px-1 rounded-sm border-l-2"
          :style="{ 
            color: displayProfile.color || 'currentColor',
            borderColor: displayProfile.color || 'transparent',
            backgroundColor: displayProfile.color ? displayProfile.color + '10' : 'transparent'
          }"
        >
          {{ displayProfile.name }}
        </div>
        
        <!-- Metrics -->
        <div v-if="viewMode === 'standard'" class="flex flex-col gap-0.5 px-1 mt-1">
          <div class="flex items-center gap-1">
             <span class="text-[9px] text-secondary bg-base px-1 rounded capitalize border border-divider">
              {{ displayProfile.category }}
             </span>
             <span v-if="displayProfile.segment_ids?.length" class="text-[9px] text-tertiary" title="Segments">
               {{ displayProfile.segment_ids.length }} Seg
             </span>
          </div>
          
          <div v-if="displayProfile.overlay_event_ids?.length" class="text-[9px] text-accent-info font-medium flex items-center gap-0.5">
             <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
             {{ displayProfile.overlay_event_ids.length }} Special
          </div>
          
          <!-- Override Indicators -->
          <div v-if="assignment.doorsOpenTime" class="text-[9px] text-accent-primary font-mono">
             Open: {{ assignment.doorsOpenTime }}
          </div>
          <div v-if="assignment.closeEarlyTime" class="text-[9px] text-accent-warning font-mono">
             Close: {{ assignment.closeEarlyTime }}
          </div>
        </div>
        
        <!-- View Mode Specifics -->
        <div v-if="viewMode === 'heatmap' && revenueDisplay" class="absolute bottom-1 right-1">
           <span class="text-[9px] font-mono text-emerald-600 font-bold">${{ revenueDisplay }}</span>
        </div>
        
        <div v-if="viewMode === 'staffing'" class="mt-auto px-1">
           <div class="flex justify-between items-end mb-0.5">
             <span class="text-[8px] text-tertiary font-mono">{{ shiftCount }} shifts</span>
           </div>
           <div class="h-1 w-full bg-base rounded-full overflow-hidden">
             <div 
               class="h-full bg-accent-success transition-all duration-500" 
               :style="{ width: shiftCoverage + '%' }"
               :class="{ 'bg-accent-warning': shiftCount < 3, 'bg-accent-success': shiftCount >= 3 }"
             ></div>
           </div>
        </div>
      </template>

      <!-- Empty/Open State -->
      <template v-else>
        <div class="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             class="text-[10px] text-accent-primary hover:underline"
             @click.stop="$emit('preview')"
           >
             Add
           </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { EffectiveAssignment } from "~/utils/schedule-calendar";
import type { BingoProgramExtended } from "~/types/bingo";

const props = defineProps<{
  date: string;
  dayOfWeek?: number;
  assignment: EffectiveAssignment;
  program?: BingoProgramExtended;
  ghostProgram?: BingoProgramExtended;
  isSelected?: boolean;
  isHoliday?: boolean;
  holidayInfo?: any;
  shifts?: any[];
  hasConflict?: boolean;
  viewMode?: string;
}>();

defineEmits(['preview']);

const displayProgram = computed(() => props.ghostProgram || props.program);
const isClosed = computed(() => props.assignment.status === 'closed');
const isLocked = computed(() => props.assignment.isLocked);
const dayNumber = computed(() => {
  const parts = props.date.split('-');
  return Number(parts[2]);
});

const isToday = computed(() => {
  const today = new Date();
  // Using local time components since props.date is YYYY-MM-DD local
  const [y, m, d] = props.date.split('-').map(Number);
  const tY = today.getFullYear();
  const tM = today.getMonth() + 1;
  const tD = today.getDate();
  return y === tY && m === tM && d === tD;
});

const revenueDisplay = computed(() => {
  // Mock revenue based on profile complexity
  return (displayProgram.value?.name?.length || 0) * 1000; 
});

const shiftCoverage = computed(() => {
  if (!props.shifts || props.shifts.length === 0) return 0;
  // Assume target is 10 shifts for full bar
  return Math.min((props.shifts.length / 10) * 100, 100);
});

const shiftCount = computed(() => props.shifts?.length || 0);

</script>

<style scoped>
.pattern-diagonal-lines {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(0, 0, 0, 0.03) 5px,
    rgba(0, 0, 0, 0.03) 10px
  );
}
</style>
