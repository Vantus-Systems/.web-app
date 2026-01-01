<template>
  <div class="flex h-full flex-col bg-slate-50 overflow-hidden">
    <!-- Top Toolbar / Header -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-black text-slate-900">Mission Control</h3>
          <span class="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Schedule Editor
          </span>
        </div>
        <p class="text-xs text-slate-400">
          {{ dateRangeLabel }}
        </p>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- View Toggle -->
        <div class="flex items-center bg-slate-100 p-1 rounded-lg">
          <button 
            v-for="mode in ['standard', 'heatmap', 'staffing']" 
            :key="mode"
            class="px-3 py-1 text-xs font-bold rounded-md transition-all capitalize"
            :class="viewMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="viewMode = mode"
          >
            {{ mode }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <div class="text-xs text-slate-400 mr-2">
            <span v-if="hasChanges" class="text-amber-600 font-bold">Unsaved Changes</span>
            <span v-else>All changes saved</span>
          </div>
          
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
             <button 
               class="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-md transition-all"
               title="Print Schedule"
               @click="printSchedule"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
             </button>
             <button 
               class="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-white rounded-md transition-all"
               :class="{'text-primary-600 bg-white shadow-sm': isTvMode}"
               title="TV Mode"
               @click="isTvMode = !isTvMode"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tv"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left: Profile Palette -->
      <div v-show="!isTvMode" class="w-64 flex-shrink-0 border-r border-slate-200 bg-white z-20 print:hidden">
        <ScheduleProfileLibrary
          :profiles="dayProfiles"
          :selected-profile-id="selectedProfileId"
          @select="selectProfile"
          @clear="selectedProfileId = null"
        />
      </div>

      <!-- Center: Infinite Canvas -->
      <div class="flex-1 relative bg-slate-100 overflow-hidden">
        <ScheduleCanvas
          :date-range="activeDateRange"
          :assignments="draft.calendar.assignments"
          :profiles="dayProfiles"
          :selected-dates="selectedDates"
          :active-tool-profile-id="selectedProfileId"
          :view-mode="viewMode"
          @select-date="handleDateSelection"
          @paint-range="handlePaintRange"
          @open-inspector="handleOpenInspector"
          @clear-selection="handleBulkClear"
          @copy-day="handleCopyDay"
          @paste-day="handlePasteDay"
          @context-menu="handleContextMenu"
          @preview-day="handlePreviewDay"
        />
      </div>

      <!-- Right: Inspector -->
      <div v-show="!isTvMode" class="w-80 flex-shrink-0 border-l border-slate-200 bg-white z-20 print:hidden">
        <ScheduleInspector
          :selected-dates="selectedDates"
          :assignments="draft.calendar.assignments"
          :profiles="dayProfiles"
          :stats="inspectorStats"
          @clear-selection="selectedDates = []"
          @apply-bulk="handleBulkApply"
          @clear-bulk="handleBulkClear"
          @smart-fill="handleSmartFill"
        />
      </div>
    </div>

    <!-- Context Menu -->
    <ScheduleContextMenu
      v-if="contextMenu"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :date="contextMenu.date"
      @close="contextMenu = null"
      @paste="handlePasteDay(contextMenu.date); contextMenu = null"
      @clear="handleClearDay(contextMenu.date); contextMenu = null"
      @lock="handleLockDay(contextMenu.date); contextMenu = null"
      @holiday="handleHolidayDay(contextMenu.date); contextMenu = null"
    />

    <!-- Mini-Timeline Popover -->
    <div v-if="previewDate" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" @click.self="previewDate = null">
      <ScheduleMiniTimeline 
        :date="previewDate"
        :profile="getProfileForDate(previewDate)"
        @close="previewDate = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRaw, watch } from "vue";
import type { OpsSchemaV2 } from "~/types/ops-schema";
import ScheduleCanvas from "~/components/admin/schedule/ScheduleCanvas.vue";
import ScheduleProfileLibrary from "~/components/admin/schedule/ScheduleProfileLibrary.vue";
import ScheduleInspector from "~/components/admin/schedule/ScheduleInspector.vue";
import ScheduleContextMenu from "~/components/admin/schedule/ScheduleContextMenu.vue";
import ScheduleMiniTimeline from "~/components/admin/schedule/ScheduleMiniTimeline.vue";

const props = defineProps<{
  modelValue: OpsSchemaV2;
}>();

const emit = defineEmits(["update:modelValue"]);

// --- State Management ---
const isSyncing = ref(false);
const isTvMode = ref(false);
const viewMode = ref<'standard' | 'heatmap' | 'staffing'>('standard');
const cloneDraft = (value: OpsSchemaV2) => JSON.parse(JSON.stringify(toRaw(value)));
const draft = ref(cloneDraft(props.modelValue));

const selectedProfileId = ref<string | null>(null);
const selectedDates = ref<string[]>([]);
const clipboard = ref<string | null>(null); // profileId stored

const contextMenu = ref<{ x: number; y: number; date: string } | null>(null);
const previewDate = ref<string | null>(null);

// --- Computed Data ---
const dayProfiles = computed(() => draft.value.dayProfiles ?? []);

const activeDateRange = computed(() => {
  return draft.value.calendar.range || {
    start: new Date().getFullYear() + "-01-01",
    end: new Date().getFullYear() + "-12-31"
  };
});

const dateRangeLabel = computed(() => {
  const s = new Date(activeDateRange.value.start);
  const e = new Date(activeDateRange.value.end);
  return `${s.toLocaleDateString(undefined, { month: 'short', year: 'numeric'})} - ${e.toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}`;
});

const hasChanges = computed(() => {
  return JSON.stringify(draft.value) !== JSON.stringify(props.modelValue);
});

const inspectorStats = computed(() => {
  const assignments = draft.value.calendar.assignments;
  let openDays = 0;
  let conflicts = 0;
  let projectedRevenue = 0; // Mock calculation or derive from profile metadata if available

  Object.values(assignments).forEach((a: any) => {
    if (a.status === 'open') openDays++;
    // Add logic for conflicts/revenue if data exists in profiles
  });

  return { openDays, projectedRevenue, conflicts };
});


// --- Actions ---

const selectProfile = (id: string) => {
  selectedProfileId.value = id;
  // If we have selected dates, apply immediately? 
  // User workflow: Select dates -> Select profile to apply? 
  // OR: Select profile (palette) -> Paint dates.
  // Let's support both. If dates are selected, apply profile to them.
  if (selectedDates.value.length > 0) {
    handleBulkApply(id);
  }
};

const handleDateSelection = (payload: { date: string; multi: boolean }) => {
  // If painting tool is active (selectedProfileId is set) AND it's a drag, Canvas handles it via paint-range.
  // This event is for explicit clicks.
  
  if (payload.multi) {
    if (selectedDates.value.includes(payload.date)) {
      selectedDates.value = selectedDates.value.filter(d => d !== payload.date);
    } else {
      selectedDates.value = [...selectedDates.value, payload.date];
    }
  } else {
    // If we have a tool selected, maybe we want to apply it?
    // User said "Palette & Paint tool interaction".
    // Usually single click with paint tool applies it.
    if (selectedProfileId.value) {
      assignProfileToDate(payload.date, selectedProfileId.value);
    } else {
      selectedDates.value = [payload.date];
    }
  }
};

const handlePaintRange = (payload: { start: string; end: string }) => {
  if (!selectedProfileId.value) return;
  
  const start = new Date(payload.start);
  const end = new Date(payload.end);
  const current = new Date(start);
  
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    assignProfileToDate(dateStr, selectedProfileId.value);
    current.setDate(current.getDate() + 1);
  }
};

const handleBulkApply = (profileId: string) => {
  if (!profileId) return;
  selectedDates.value.forEach(date => {
    assignProfileToDate(date, profileId);
  });
};

const handleBulkClear = () => {
  selectedDates.value.forEach(date => {
    delete draft.value.calendar.assignments[date];
  });
};

const handleSmartFill = (payload: { profileId: string; days: string[] }) => {
  const start = new Date(activeDateRange.value.start);
  const end = new Date(activeDateRange.value.end);
  let current = new Date(start);
  
  // Align to first day
  current.setDate(current.getDate() + 1); // Fix timezone offset issues or start strictly?
  // Actually, standard date iteration:
  current = new Date(`${activeDateRange.value.start}T00:00:00`);
  const endDate = new Date(`${activeDateRange.value.end}T00:00:00`);
  
  while (current <= endDate) {
    const dayName = current.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue...
    if (payload.days.includes(dayName)) {
      const dateStr = current.toISOString().slice(0, 10);
      assignProfileToDate(dateStr, payload.profileId);
    }
    current.setDate(current.getDate() + 1);
  }
};

const printSchedule = () => {
  window.print();
};

const assignProfileToDate = (date: string, profileId: string) => {
  draft.value.calendar.assignments[date] = {
    status: "open",
    profile_id: profileId,
  };
};

const getProfileForDate = (dateStr: string) => {
  const assignment = draft.value.calendar.assignments[dateStr];
  if (!assignment) return undefined;
  return dayProfiles.value.find((p: any) => p.id === assignment.profile_id);
};

// --- New Features Handlers ---

const handleOpenInspector = () => {
  // Focus inspector if needed, or just standard "open" behavior (already always visible)
};

const handleCopyDay = (dateStr: string) => {
  const assignment = draft.value.calendar.assignments[dateStr];
  if (assignment) {
    clipboard.value = assignment.profile_id;
  } else {
    clipboard.value = null;
  }
};

const handlePasteDay = (dateStr: string) => {
  if (clipboard.value) {
    assignProfileToDate(dateStr, clipboard.value);
  }
};

const handleClearDay = (dateStr: string) => {
  delete draft.value.calendar.assignments[dateStr];
};

const handleLockDay = (dateStr: string) => {
  // Mock lock implementation
  alert("Day locked: " + dateStr);
};

const handleHolidayDay = (dateStr: string) => {
  // Mock holiday implementation
  alert("Holiday applied: " + dateStr);
};

const handleContextMenu = (payload: { event: MouseEvent; date: string }) => {
  contextMenu.value = {
    x: payload.event.clientX,
    y: payload.event.clientY,
    date: payload.date
  };
};

const handlePreviewDay = (dateStr: string) => {
  previewDate.value = dateStr;
};

// --- Watchers ---

watch(
  () => props.modelValue,
  (value) => {
    isSyncing.value = true;
    draft.value = cloneDraft(value);
    nextTick(() => {
      isSyncing.value = false;
    });
  },
  { deep: true, immediate: true }
);

watch(
  draft,
  (value) => {
    if (!isSyncing.value) {
      emit("update:modelValue", cloneDraft(value));
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* No specific styles needed with Tailwind */
</style>