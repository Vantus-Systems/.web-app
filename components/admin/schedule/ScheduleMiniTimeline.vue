<template>
  <div class="p-4 bg-surface rounded-lg shadow-xl border border-divider w-[500px]">
    <div class="flex items-center justify-between mb-4 border-b border-divider pb-2">
      <div>
        <h3 class="font-black text-primary text-lg">{{ formattedDate }}</h3>
        <div class="text-xs text-tertiary font-medium uppercase tracking-wider">
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
      <div class="absolute top-0 bottom-0 w-full flex justify-between px-2 text-[9px] text-tertiary select-none pointer-events-none z-10">
        <span
            v-for="tick in ticks"
            :key="tick.label"
            class="border-l border-divider h-full pl-0.5 pt-1"
            :style="{ left: tick.percent + '%', position: 'absolute' }"
        >
            {{ tick.label }}
        </span>
      </div>

      <!-- Operational Window (Background) -->
      <div
        class="absolute top-0 bottom-0 bg-surface/50 border-x border-divider"
        :style="{ left: opStartPercent + '%', right: (100 - opEndPercent) + '%' }"
      ></div>

      <!-- Segments (Flow) -->
      <div class="absolute top-8 left-0 right-0 h-8 mx-0 z-20">
         <div 
           v-for="(seg, idx) in sortedSegments"
           :key="idx"
           class="h-full absolute top-0 rounded-sm shadow-sm border border-white/10 group overflow-hidden"
           :class="getSegmentColor(seg.type)"
           :style="{ left: getPercent(seg.start) + '%', width: getDurationPercent(seg.start, seg.end) + '%' }"
         >
            <div class="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <!-- Tooltip -->
            <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-surface-dark text-base-light text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-divider">
               {{ seg.name || seg.type }} ({{ seg.start }} - {{ seg.end }})
            </div>
         </div>
      </div>
      
      <!-- Logic Triggers -->
      <template v-for="(trig, idx) in logicTriggers" :key="idx">
        <div
            class="absolute top-6 w-0.5 h-12 z-30 group"
            :class="getTriggerColor(trig.type)"
            :style="{ left: getPercent(trig.time) + '%' }"
        >
            <div
                class="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full border-2 border-surface shadow-sm transform transition-transform group-hover:scale-125"
                :class="getTriggerBg(trig.type)"
                :title="trig.name"
            />
            <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-surface-dark text-base-light text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
               {{ trig.name }} @ {{ trig.time }}
            </div>
        </div>
      </template>
    </div>

    <!-- Computed Stats (Placeholder until real aggregation available) -->
    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="p-2 bg-base rounded border border-divider">
        <div class="text-[10px] text-tertiary uppercase font-bold">Revenue</div>
        <div class="font-mono font-bold text-primary">{{ projectedRevenue ? '$' + formatMoney(projectedRevenue) : '-' }}</div>
      </div>
      <div class="p-2 bg-base rounded border border-divider">
        <div class="text-[10px] text-tertiary uppercase font-bold">Labor</div>
        <div class="font-mono font-bold text-primary">{{ laborPercent ? laborPercent + '%' : '-' }}</div>
      </div>
      <div class="p-2 bg-base rounded border border-divider">
        <div class="text-[10px] text-tertiary uppercase font-bold">Staff</div>
        <div class="font-mono font-bold text-primary">{{ staffCount ? staffCount + ' Active' : '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  date?: string;
  profileName?: string;
  flowSegments?: any[];
  overlayEvents?: any[];
  logicTriggers?: any[];
  operationalHours?: { start: string; end: string };
  // Real stats
  projectedRevenue?: number;
  laborPercent?: number;
  staffCount?: number;
}>();

defineEmits(["close"]);

const formattedDate = computed(() => {
  if (!props.date) return 'Timeline Preview';
  return new Date(props.date).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
});

// Time Helpers
const timeToMinutes = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    // Handle late night hours (00:00 - 05:00) by adding 24h
    // Assuming day starts at 06:00
    if (h < 6) return (h + 24) * 60 + m;
    return h * 60 + m;
};

const DAY_START = 8 * 60; // 08:00
const DAY_END = 29 * 60; // 05:00 next day
const TOTAL_MINUTES = DAY_END - DAY_START;

const getPercent = (time: string) => {
    const mins = timeToMinutes(time);
    const p = ((mins - DAY_START) / TOTAL_MINUTES) * 100;
    return Math.max(0, Math.min(100, p));
};

const getDurationPercent = (start: string, end: string) => {
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);
    return ((e - s) / TOTAL_MINUTES) * 100;
};

// Ticks generation
const ticks = computed(() => {
    const t = [];
    for (let h = 8; h < 29; h += 2) {
        const hourLabel = h > 24 ? h - 24 : h;
        const timeStr = `${hourLabel < 10 ? '0' : ''}${hourLabel}:00`;
        // We need to pass standard format to getPercent if we were using it for labels,
        // but here we iterate internal hours.
        // Let's just reconstruct the time string for the helper
        const realH = h >= 24 ? h - 24 : h;
        const s = `${realH < 10 ? '0' : ''}${realH}:00`;
        t.push({
            label: `${realH}:00`,
            percent: ((h * 60 - DAY_START) / TOTAL_MINUTES) * 100
        });
    }
    return t;
});

const opStartPercent = computed(() => getPercent(props.operationalHours?.start || '09:00'));
const opEndPercent = computed(() => getPercent(props.operationalHours?.end || '02:00'));

const sortedSegments = computed(() => {
    if (!props.flowSegments) return [];
    return [...props.flowSegments].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
});

// Styling Helpers
const getSegmentColor = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'session': return 'bg-accent-primary';
        case 'break': return 'bg-tertiary';
        case 'special': return 'bg-accent-warning text-black';
        case 'maintenance': return 'bg-accent-error';
        default: return 'bg-secondary';
    }
};

const getTriggerColor = (type: string) => {
     switch (type?.toLowerCase()) {
        case 'open': return 'bg-accent-success';
        case 'close': return 'bg-accent-error';
        default: return 'bg-accent-info';
    }
};

const getTriggerBg = (type: string) => {
     switch (type?.toLowerCase()) {
        case 'open': return 'bg-accent-success';
        case 'close': return 'bg-accent-error';
        default: return 'bg-accent-info';
    }
};

const formatMoney = (val: number) => {
  return new Intl.NumberFormat('en-US').format(val);
};
</script>
