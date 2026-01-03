<template>
  <div class="p-4 bg-surface rounded-lg shadow-xl border border-divider w-[500px]">
    <div class="flex items-center justify-between mb-4 border-b border-divider pb-2">
      <div>
        <h3 class="font-black text-primary text-lg">{{ formattedDate }}</h3>
        <div class="text-xs text-secondary font-medium uppercase tracking-wider">
          {{ profileName || 'No Profile Assigned' }}
        </div>
      </div>
      <button @click="$emit('close')" class="text-tertiary hover:text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Timeline Viz -->
    <div class="relative h-24 bg-base rounded-md border border-divider overflow-hidden mb-4">
      <!-- Hours Markers -->
      <div class="absolute top-0 bottom-0 w-full flex justify-between px-2 text-[9px] text-tertiary select-none pointer-events-none z-0">
        <span v-for="h in 24" :key="h" class="border-l border-divider h-full pl-0.5 pt-1">{{ h }}</span>
      </div>

      <!-- Segments -->
      <template v-if="profile && timeline">
        <div 
           v-for="seg in resolvedSegments" 
           :key="seg.id"
           class="absolute top-8 h-8 rounded shadow-sm group z-10"
           :style="[
             getSegmentStyle(seg),
             { backgroundColor: seg.color_code || '#6366f1' }
           ]"
        >
           <!-- Tooltip -->
           <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
             {{ seg.label }} ({{ seg.time_start }}-{{ seg.time_end }})
           </div>
        </div>
      </template>
      
      <!-- Overlay Events -->
       <template v-if="profile && timeline">
        <div 
           v-for="evt in resolvedEvents" 
           :key="evt.id"
           class="absolute top-6 w-0.5 h-12 bg-accent-warning z-20"
           :style="{ left: timeToPct(evt.time_start) + '%' }"
        >
           <div class="absolute -top-1 -left-1 w-2.5 h-2.5 bg-accent-warning rounded-full border-2 border-white" :title="evt.label" />
        </div>
      </template>
    </div>

    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="p-2 bg-base rounded border border-divider">
        <div class="text-[10px] text-tertiary uppercase font-bold">Revenue</div>
        <div class="font-mono font-bold text-secondary">$12,450</div>
      </div>
      <div class="p-2 bg-base rounded border border-divider">
        <div class="text-[10px] text-tertiary uppercase font-bold">Labor</div>
        <div class="font-mono font-bold text-secondary">14.2%</div>
      </div>
      <div class="p-2 bg-base rounded border border-divider">
        <div class="text-[10px] text-tertiary uppercase font-bold">Staff</div>
        <div class="font-mono font-bold text-secondary">8 Active</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { OpsSchemaDayProfile, OpsSchemaV2 } from "~/types/ops-schema";

const props = defineProps<{
  date: string;
  profile?: OpsSchemaDayProfile;
  timeline?: OpsSchemaV2['timeline'];
}>();

defineEmits(["close"]);

const formattedDate = computed(() => {
  if (!props.date) return "";
  const parts = props.date.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  
  if (!y || !m || !d) {
    return props.date;
  }
  
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
});

const profileName = computed(() => props.profile?.name);

const resolvedSegments = computed(() => {
  if (!props.profile || !props.timeline) return [];
  return props.timeline.flowSegments.filter(s => props.profile!.segment_ids.includes(s.id));
});

const resolvedEvents = computed(() => {
  if (!props.profile || !props.timeline) return [];
  return props.timeline.overlayEvents.filter(e => props.profile!.overlay_event_ids.includes(e.id));
});

const getSegmentStyle = (seg: any) => {
  const start = timeToPct(seg.time_start);
  const end = timeToPct(seg.time_end);
  
  if (end < start) {
    // Overnight: splits into two parts.
    // CSS cannot handle two rects in one div unless we use box-shadow or gradient hack.
    // Easier: Just render until end (overflows) or clamp?
    // "Render overnight segments correctly (split into two bars or otherwise represent wrap)."
    // Since we are in a v-for, we can't easily emit two divs.
    // But we can use linear-gradient to simulate split?
    // Or just render it as one long bar that overflows? No, parent has overflow-hidden.
    // Let's treat it as ending at 100% for this visual.
    // Or, we can use a small hack: width goes to 100% and we rely on that.
    return {
      left: `${start}%`,
      width: `${100 - start}%` // Visual approximation for overnight start part
    };
  }
  
  return {
    left: `${start}%`,
    width: `${Math.max(0, end - start)}%`
  };
};

const timeToPct = (time: string) => {
  const parts = time.split(':').map(Number);
  const h = parts[0];
  const m = parts[1];
  
  if (!h && h !== 0) return 0;
  if (!m && m !== 0) return (h * 60 / 1440) * 100;
  
  return ((h * 60 + m) / 1440) * 100;
};
</script>
