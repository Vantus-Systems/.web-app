<template>
  <div class="h-full flex flex-col bg-surface border-l border-divider overflow-y-auto">
    <!-- Context Header -->
    <div class="p-4 border-b border-divider bg-base/50">
      <h3 class="text-xs font-bold text-tertiary uppercase tracking-[0.2em]">
        {{ modeLabel }}
      </h3>
    </div>

    <!-- MODE: NO SELECTION (Month Summary) -->
    <div v-if="mode === 'summary'" class="p-4 space-y-6">
      <div class="space-y-1">
        <div class="text-3xl font-black text-primary">{{ stats.openDays }}</div>
        <div class="text-xs font-medium text-secondary uppercase tracking-wide">
          Scheduled Days
        </div>
      </div>
      
      <div class="space-y-1">
        <div class="text-3xl font-black text-accent-success">
          ${{ formatMoney(stats.projectedRevenue) }}
        </div>
        <div class="text-xs font-medium text-secondary uppercase tracking-wide">
          Proj. Revenue
        </div>
      </div>

      <!-- Smart Fill Tool -->
      <div class="pt-4 border-t border-divider space-y-3">
        <div class="flex items-center gap-2">
           <div class="w-2 h-2 rounded-full bg-accent-primary"></div>
           <h4 class="text-xs font-bold text-primary uppercase">Smart Fill</h4>
        </div>
        <p class="text-[10px] text-tertiary">Apply a profile to specific weekdays across the entire range.</p>
        
        <div class="space-y-2">
           <select
             v-model="smartFillProfileId"
             class="w-full text-xs bg-base border border-divider rounded-lg px-2 py-2 outline-none focus:border-accent-primary text-primary"
           >
             <option :value="null">Select Profile...</option>
             <option v-for="p in profiles" :key="p.id" :value="p.id">{{ p.name }}</option>
           </select>
           
           <div class="flex flex-wrap gap-1">
             <button
               v-for="(day, index) in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
               :key="day"
               class="px-2 py-1 text-[10px] font-bold border rounded transition-colors"
               :class="smartFillDays.includes(index) ? 'bg-accent-primary text-white border-accent-primary' : 'bg-surface text-secondary border-divider hover:border-tertiary'"
               @click="toggleSmartFillDay(index)"
             >
               {{ day }}
             </button>
           </div>
           
           <button
             class="w-full py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
             :disabled="!smartFillProfileId || smartFillDays.length === 0"
             @click="applySmartFill"
           >
             Apply Pattern
           </button>
        </div>
      </div>

      <div class="pt-4 border-t border-divider">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-secondary">Validation</span>
          <span 
            class="text-xs font-bold px-2 py-0.5 rounded-full"
            :class="stats.conflicts > 0 ? 'bg-accent-error/10 text-accent-error' : 'bg-accent-success/10 text-accent-success'"
          >
            {{ stats.conflicts }} Issues
          </span>
        </div>
        <p class="text-xs text-tertiary leading-relaxed">
          {{ stats.conflicts > 0 ? 'Review conflicts marked in red on the calendar.' : 'All checks passed.' }}
        </p>
      </div>
    </div>

    <!-- MODE: SINGLE SELECTION -->
    <div v-else-if="mode === 'single'" class="p-4 space-y-6">
      <div>
        <h2 class="text-xl font-bold text-primary">{{ formatDate(selectedDates[0]) }}</h2>
        <p class="text-xs text-secondary mt-1">Day Detail</p>
      </div>

      <div v-if="selectedAssignment.effectiveProfileId" class="space-y-4">
        <div class="p-3 bg-base border border-divider rounded-lg">
          <div class="text-xs font-bold text-tertiary uppercase mb-1">Assigned Profile</div>
          <div class="font-bold text-accent-primary">{{ selectedProfile?.name || 'Unknown Profile' }}</div>
          <div v-if="selectedProfile?.doors_open_time" class="text-xs text-secondary mt-1">
            Doors Open: {{ selectedProfile.doors_open_time }}
          </div>
        </div>
        
        <!-- Overrides Display -->
        <div v-if="selectedAssignment.overrideReasons.length" class="p-3 bg-accent-info/5 border border-accent-info/20 rounded-lg">
           <div class="text-xs font-bold text-accent-info uppercase mb-1">Active Overrides</div>
           <ul class="list-disc list-inside text-xs text-secondary">
             <li v-for="(reason, idx) in selectedAssignment.overrideReasons" :key="idx">{{ reason }}</li>
           </ul>
        </div>

        <div>
          <div class="text-xs font-bold text-tertiary uppercase mb-2">Timeline Preview</div>
          <ScheduleMiniTimeline
            v-if="selectedProfile"
            :profile="selectedProfile"
            :timeline="{ flowSegments: [], overlayEvents: [], operationalHours: { start: '09:00', end: '03:00', isOpen: true } }" 
          />
          <!-- Note: Passing full timeline would require props drilling. For now passing partial or needing fetch. 
               Ideally ScheduleInspector should receive full schema or timeline defs. 
               For now, assume ScheduleMiniTimeline can handle profile-only if segments are enriched, 
               or we need to pass timeline from OpsSchemaCalendarEditor. -->
        </div>

        <button
          class="w-full py-2 border border-accent-error/20 text-accent-error text-xs font-bold uppercase rounded-lg hover:bg-accent-error/5 transition-colors"
          @click="$emit('clear-selection')"
        >
          Clear Assignment
        </button>
      </div>

      <div v-else-if="selectedAssignment.status === 'closed'" class="text-center py-8">
         <div class="text-lg font-bold text-tertiary mb-2">Closed</div>
         <p class="text-xs text-secondary mb-4">This day is marked as closed.</p>
         <button
          class="px-4 py-2 bg-base border border-divider rounded hover:bg-surface text-xs font-bold"
          @click="$emit('clear-selection')"
        >
          Re-open
        </button>
      </div>

      <div v-else class="text-center py-8 text-tertiary text-sm">
        No profile assigned to this day.
        <br />
        <span class="text-xs opacity-70">Select a profile from the library to assign.</span>
      </div>
      
      <!-- Overrides Editor (Quick Actions) -->
      <div class="pt-4 border-t border-divider space-y-2">
         <label class="text-xs font-bold text-secondary uppercase">Overrides</label>
         <div class="grid grid-cols-2 gap-2">
           <button class="p-2 border border-divider rounded text-xs hover:bg-base" @click="emitOverride('DOORS_OPEN')">
             Set Doors Open
           </button>
           <button class="p-2 border border-divider rounded text-xs hover:bg-base" @click="emitOverride('CLOSE_EARLY')">
             Close Early
           </button>
           <button class="p-2 border border-divider rounded text-xs hover:bg-base" @click="emitOverride('CLOSED')">
             Close Day
           </button>
           <button class="p-2 border border-divider rounded text-xs hover:bg-base" @click="emitOverride('LOCKED')">
             Lock Day
           </button>
         </div>
      </div>
    </div>

    <!-- MODE: MULTI SELECTION -->
    <div v-else-if="mode === 'multi'" class="p-4 space-y-6">
      <div class="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-4 text-center">
        <div class="text-3xl font-black text-accent-primary">{{ selectedDates.length }}</div>
        <div class="text-xs font-bold text-accent-primary uppercase tracking-wide">Days Selected</div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-secondary uppercase">Bulk Actions</label>
        
        <select
          class="w-full text-sm bg-surface border border-divider rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent-primary/20 text-primary"
          @change="(e: any) => $emit('apply-bulk', e.target.value)"
        >
          <option value="">Apply Profile...</option>
          <option
            v-for="p in profiles"
            :key="p.id"
            :value="p.id"
          >
            {{ p.name }}
          </option>
        </select>

        <button
          class="w-full py-2 border border-divider text-secondary text-xs font-bold uppercase rounded-lg hover:bg-base transition-colors"
          @click="$emit('clear-bulk')"
        >
          Clear All Selected
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { OpsSchemaV2, OpsSchemaDayProfile, OpsSchemaCalendarOverride } from "~/types/ops-schema";
import { resolveEffectiveAssignment, addDays, parseDateKey } from "~/utils/schedule-calendar";
import ScheduleMiniTimeline from "./ScheduleMiniTimeline.vue";

const props = defineProps<{
  selectedDates: string[];
  calendar: OpsSchemaV2['calendar'];
  profiles: OpsSchemaDayProfile[];
  holidays: any[];
}>();

const emit = defineEmits(["clear-selection", "apply-bulk", "clear-bulk", "smart-fill", "update-override"]);

const smartFillProfileId = ref<string | null>(null);
const smartFillDays = ref<number[]>([]); // 0=Sun, 1=Mon...

const toggleSmartFillDay = (dayIndex: number) => {
  if (smartFillDays.value.includes(dayIndex)) {
    smartFillDays.value = smartFillDays.value.filter(d => d !== dayIndex);
  } else {
    smartFillDays.value.push(dayIndex);
  }
};

const applySmartFill = () => {
  if (smartFillProfileId.value && smartFillDays.value.length > 0) {
    emit("smart-fill", {
      profileId: smartFillProfileId.value,
      weekdays: smartFillDays.value
    });
  }
};

const mode = computed(() => {
  if (props.selectedDates.length === 0) return "summary";
  if (props.selectedDates.length === 1) return "single";
  return "multi";
});

const modeLabel = computed(() => {
  switch (mode.value) {
    case "summary": return "Month Summary";
    case "single": return "Day Detail";
    case "multi": return "Bulk Edit";
    default: return "Inspector";
  }
});

const selectedAssignment = computed(() => {
  if (mode.value !== 'single') return { status: 'open', effectiveProfileId: null, overrideReasons: [] };
  return resolveEffectiveAssignment(props.calendar, props.selectedDates[0]);
});

const selectedProfile = computed(() => {
  if (!selectedAssignment.value.effectiveProfileId) return null;
  return props.profiles.find(p => p.id === selectedAssignment.value.effectiveProfileId);
});

const stats = computed(() => {
  const range = props.calendar.range || {
    start: new Date().getFullYear() + "-01-01",
    end: new Date().getFullYear() + "-12-31"
  };
  
  let openDays = 0;
  let revenue = 0;
  let conflicts = 0;
  
  let current = range.start;
  const end = range.end;
  
  // Limit iterations to prevent UI freeze on huge ranges (max 2 years)
  let iterations = 0;
  
  while (current <= end && iterations < 730) {
    const eff = resolveEffectiveAssignment(props.calendar, current);
    
    // Check conflicts
    // 1. Holiday Closed but Status Open
    const holiday = props.holidays.find(h => h.date === current);
    if (holiday && holiday.closureType === 'CLOSED' && eff.status === 'open') {
      conflicts++;
    }
    
    // 2. Open but no profile
    if (eff.status === 'open' && !eff.effectiveProfileId) {
      conflicts++;
    }
    
    if (eff.status === 'open' && eff.effectiveProfileId) {
      openDays++;
      
      // Calculate revenue estimate
      const profile = props.profiles.find(p => p.id === eff.effectiveProfileId);
      if (profile) {
        // Heuristic: Base value + (Segments * 1000) + (Overlays * 2000)
        // This gives some variance based on complexity
        const segmentValue = (profile.segment_ids?.length || 0) * 1000;
        const overlayValue = (profile.overlay_event_ids?.length || 0) * 2000;
        revenue += (5000 + segmentValue + overlayValue);
      }
    }
    
    current = addDays(current, 1);
    iterations++;
  }
  
  return {
    openDays,
    projectedRevenue: revenue,
    conflicts
  };
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

const formatMoney = (val: number) => {
  return new Intl.NumberFormat('en-US').format(val);
};

const emitOverride = (kind: "LOCKED" | "CLOSED" | "CLOSE_EARLY" | "DOORS_OPEN") => {
  const date = props.selectedDates[0];
  if (!date) return;
  
  const override: OpsSchemaCalendarOverride = {
    id: crypto.randomUUID(),
    kind,
    reason: `Manual ${kind}`
  };
  
  // For time-based overrides, use user input
  if (kind === 'DOORS_OPEN') {
     override.doors_open_time = overrideDoorsTime.value;
     override.reason = `Doors Open ${overrideDoorsTime.value}`;
  } else if (kind === 'CLOSE_EARLY') {
     override.untilTime = overrideCloseTime.value;
     override.reason = `Close Early ${overrideCloseTime.value}`;
  }
  
  emit('update-override', { date, override });
};
</script>