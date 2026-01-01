<template>
  <div class="h-full flex flex-col bg-white border-l border-slate-200 overflow-y-auto">
    <!-- Context Header -->
    <div class="p-4 border-b border-slate-200 bg-slate-50/50">
      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
        {{ modeLabel }}
      </h3>
    </div>

    <!-- MODE: NO SELECTION (Month Summary) -->
    <div v-if="mode === 'summary'" class="p-4 space-y-6">
      <div class="space-y-1">
        <div class="text-3xl font-black text-slate-900">{{ stats.openDays }}</div>
        <div class="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Scheduled Days
        </div>
      </div>
      
      <div class="space-y-1">
        <div class="text-3xl font-black text-emerald-600">
          ${{ formatMoney(stats.projectedRevenue) }}
        </div>
        <div class="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Proj. Revenue
        </div>
      </div>

      <!-- Smart Fill Tool -->
      <div class="pt-4 border-t border-slate-100 space-y-3">
        <div class="flex items-center gap-2">
           <div class="w-2 h-2 rounded-full bg-primary-500"></div>
           <h4 class="text-xs font-bold text-slate-900 uppercase">Smart Fill</h4>
        </div>
        <p class="text-[10px] text-slate-400">Apply a profile to specific weekdays across the entire range.</p>
        
        <div class="space-y-2">
           <select
             v-model="smartFillProfileId"
             class="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 outline-none focus:border-primary-500"
           >
             <option :value="null">Select Profile...</option>
             <option v-for="p in profiles" :key="p.id" :value="p.id">{{ p.name }}</option>
           </select>
           
           <div class="flex flex-wrap gap-1">
             <button
               v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
               :key="day"
               class="px-2 py-1 text-[10px] font-bold border rounded transition-colors"
               :class="smartFillDays.includes(day) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'"
               @click="toggleSmartFillDay(day)"
             >
               {{ day }}
             </button>
           </div>
           
           <button
             class="w-full py-2 bg-slate-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
             :disabled="!smartFillProfileId || smartFillDays.length === 0"
             @click="applySmartFill"
           >
             Apply Pattern
           </button>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-600">Validation</span>
          <span 
            class="text-xs font-bold px-2 py-0.5 rounded-full"
            :class="stats.conflicts > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'"
          >
            {{ stats.conflicts }} Issues
          </span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          {{ stats.conflicts > 0 ? 'Review conflicts marked in red on the calendar.' : 'All checks passed.' }}
        </p>
      </div>
    </div>

    <!-- MODE: SINGLE SELECTION -->
    <div v-else-if="mode === 'single'" class="p-4 space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900">{{ formatDate(selectedDates[0]) }}</h2>
        <p class="text-xs text-slate-500 mt-1">Day Detail</p>
      </div>

      <div v-if="selectedProfile" class="space-y-4">
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="text-xs font-bold text-slate-400 uppercase mb-1">Assigned Profile</div>
          <div class="font-bold text-primary-700">{{ selectedProfile.name }}</div>
          <div class="text-xs text-slate-500 mt-1">
            {{ selectedProfile.timeline?.operationalHours?.start }} - {{ selectedProfile.timeline?.operationalHours?.end }}
          </div>
        </div>

        <div>
          <div class="text-xs font-bold text-slate-400 uppercase mb-2">Timeline Preview</div>
          <ScheduleMiniTimeline
            :flow-segments="selectedProfile.timeline?.flowSegments || []"
            :overlay-events="selectedProfile.timeline?.overlayEvents || []"
            :logic-triggers="selectedProfile.logicTriggers || []"
            :operational-hours="selectedProfile.timeline?.operationalHours || { start: '09:00', end: '03:00' }"
          />
        </div>

        <div class="pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-600">Staffing</span>
            <span class="text-[10px] text-slate-400 italic">Est.</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-slate-700">
             <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
             <span>Readiness data unavailable</span>
          </div>
        </div>

        <button
          class="w-full py-2 border border-rose-200 text-rose-600 text-xs font-bold uppercase rounded-lg hover:bg-rose-50 transition-colors"
          @click="$emit('clear-selection')"
        >
          Clear Assignment
        </button>
      </div>

      <div v-else class="text-center py-8 text-slate-400 text-sm">
        No profile assigned to this day.
        <br />
        <span class="text-xs opacity-70">Select a profile from the library to assign.</span>
      </div>
    </div>

    <!-- MODE: MULTI SELECTION -->
    <div v-else-if="mode === 'multi'" class="p-4 space-y-6">
      <div class="bg-primary-50 border border-primary-100 rounded-lg p-4 text-center">
        <div class="text-3xl font-black text-primary-600">{{ selectedDates.length }}</div>
        <div class="text-xs font-bold text-primary-400 uppercase tracking-wide">Days Selected</div>
      </div>

      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-500 uppercase">Bulk Actions</label>
        
        <select
          class="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500/20"
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
          class="w-full py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase rounded-lg hover:bg-slate-50 transition-colors"
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
import ScheduleMiniTimeline from "./ScheduleMiniTimeline.vue";

const props = defineProps<{
  selectedDates: string[];
  assignments: Record<string, string>; // date -> profileId
  profiles: any[];
  stats: { openDays: number; projectedRevenue: number; conflicts: number };
}>();

const emit = defineEmits(["clear-selection", "apply-bulk", "clear-bulk", "smart-fill"]);

const smartFillProfileId = ref<string | null>(null);
const smartFillDays = ref<string[]>([]);

const toggleSmartFillDay = (day: string) => {
  if (smartFillDays.value.includes(day)) {
    smartFillDays.value = smartFillDays.value.filter(d => d !== day);
  } else {
    smartFillDays.value.push(day);
  }
};

const applySmartFill = () => {
  if (smartFillProfileId.value && smartFillDays.value.length > 0) {
    emit("smart-fill", {
      profileId: smartFillProfileId.value,
      days: smartFillDays.value
    });
    // Reset? Maybe keep for repeated application
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

const selectedProfile = computed(() => {
  if (mode.value !== "single") return null;
  const date = props.selectedDates[0];
  const pid = props.assignments[date];
  return props.profiles.find(p => p.id === pid);
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

const formatMoney = (val: number) => {
  return new Intl.NumberFormat('en-US').format(val);
};
</script>
