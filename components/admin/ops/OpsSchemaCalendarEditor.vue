<template>
  <div class="flex h-full bg-base overflow-hidden">
    <!-- Sidebar: Library -->
    <div class="w-64 flex-none border-r border-divider bg-surface z-20 shadow-sm">
      <ScheduleProfileLibrary
        :profiles="effectiveProfiles"
        :active-tool-profile-id="activeToolProfileId"
        @select-tool="selectTool"
        @create-profile="$emit('create-profile')"
      />
    </div>

    <!-- Main Canvas -->
    <div class="flex-1 flex flex-col min-w-0 bg-base">
      <!-- Toolbar -->
      <div class="h-12 border-b border-divider bg-surface flex items-center justify-between px-4 z-10">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <button
                class="p-1.5 rounded hover:bg-base text-secondary hover:text-primary transition-colors"
                title="Undo (Cmd+Z)"
                @click="undo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button
                class="p-1.5 rounded hover:bg-base text-secondary hover:text-primary transition-colors"
                title="Redo (Cmd+Shift+Z)"
                @click="redo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
            </button>
          </div>

          <div class="h-4 w-px bg-divider"></div>

          <div class="flex items-center gap-1 bg-base p-0.5 rounded-lg border border-divider">
             <button 
               v-for="m in ['standard', 'heatmap', 'staffing']"
               :key="m"
               class="px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors"
               :class="viewMode === m ? 'bg-surface text-primary shadow-sm' : 'text-secondary hover:text-primary'"
               @click="viewMode = m as any"
             >
               {{ m }}
             </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
           <button
             class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase text-secondary hover:text-primary hover:bg-base rounded transition-colors"
             @click="printSchedule"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
             Print
           </button>
           <button
             class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase text-secondary hover:text-accent-primary hover:bg-base rounded transition-colors"
             @click="openTvMode"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
             TV Mode
           </button>
        </div>
      </div>

      <!-- Canvas -->
      <ScheduleCanvas
        :date-range="calendar.range"
        :assignments="simpleAssignments"
        :profiles="effectiveProfiles"
        :selected-dates="selectedDates"
        :active-tool-profile-id="activeToolProfileId"
        :view-mode="viewMode"
        :revenue="projectedRevenueMap"
        :staffing="staffingMap"
        :holidays="holidayMap"
        @select-date="handleSelectDate"
        @paint-range="handlePaintRange"
        @open-inspector="isInspectorOpen = true"
        @clear-selection="handleClearSelection"
        @copy-day="handleCopyDay"
        @paste-day="handlePasteDay"
        @context-menu="handleContextMenu"
        @preview-day="handlePreviewDay"
        @extend-range="handleExtendRange"
      />
    </div>

    <!-- Inspector -->
    <div
        v-if="isInspectorOpen"
        class="w-80 flex-none border-l border-divider bg-surface z-20 shadow-lg"
    >
      <ScheduleInspector
        :selected-dates="selectedDates"
        :assignments="simpleAssignments"
        :profiles="effectiveProfiles"
        :stats="rangeStats"
        :staffing="staffingMap"
        @clear-selection="handleClearSelection"
        @apply-bulk="handleApplyBulk"
        @clear-bulk="handleClearBulk"
        @smart-fill="handleSmartFill"
        @close="isInspectorOpen = false"
      />
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
      @holiday="handleApplyHoliday(contextMenu.date); contextMenu = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { OpsSchemaV2 } from "~/types/ops-schema";
import ScheduleProfileLibrary from "../schedule/ScheduleProfileLibrary.vue";
import ScheduleCanvas from "../schedule/ScheduleCanvas.vue";
import ScheduleInspector from "../schedule/ScheduleInspector.vue";
import ScheduleContextMenu from "../schedule/ScheduleContextMenu.vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  modelValue: OpsSchemaV2;
  profiles?: any[];
}>();

const emit = defineEmits(["update:modelValue", "create-profile"]);
const router = useRouter();

// State
const calendar = computed(() => props.modelValue.calendar);
const activeToolProfileId = ref<string | null>(null);
const selectedDates = ref<string[]>([]);
const isInspectorOpen = ref(true);
const viewMode = ref<'standard' | 'heatmap' | 'staffing'>('standard');
const clipboardProfileId = ref<string | null>(null);
const contextMenu = ref<{ x: number; y: number; date: string } | null>(null);

// Profiles Fallback
const effectiveProfiles = computed(() => {
    return props.profiles || props.modelValue.dayProfiles || [];
});

// Assignments Mapper (Schema Object -> Simple ID Map)
const simpleAssignments = computed(() => {
    const map: Record<string, string> = {};
    if (!calendar.value?.assignments) return map;

    for (const [date, val] of Object.entries(calendar.value.assignments)) {
        if (val && val.profile_id) {
             map[date] = val.profile_id;
        }
    }
    return map;
});

// History (Mock for now)
const undo = () => console.log("Undo not implemented fully");
const redo = () => console.log("Redo not implemented fully");

// --- Holidays ---
const holidays = ref<any[]>([]);
const holidayMap = computed(() => {
    const map: Record<string, { name: string; type: 'closed' | 'special' }> = {};
    for (const h of holidays.value) {
        map[h.date] = {
            name: h.name,
            type: h.closureType === 'CLOSED' ? 'closed' : 'special'
        };
    }
    return map;
});

const fetchHolidays = async () => {
    const currentYear = new Date().getFullYear();
    try {
        const [y1, y2] = await Promise.all([
             $fetch('/api/admin/holiday-rules', { query: { year: currentYear } }),
             $fetch('/api/admin/holiday-rules', { query: { year: currentYear + 1 } })
        ]);
        holidays.value = [...(y1.occurrences || []), ...(y2.occurrences || [])];
    } catch (e) {
        console.error("Failed to fetch holidays", e);
    }
};

onMounted(() => {
    fetchHolidays();
});

// --- Computed Data Maps ---

// Mock/Derived Revenue
const projectedRevenueMap = computed(() => {
    // Return empty until real integration is available to avoid fake data
    return {};
});

// Staffing (Mock/Empty)
const staffingMap = computed(() => {
    // Return empty until real integration is available
    return {};
});

// Range Stats
const rangeStats = computed(() => {
    const dates = selectedDates.value.length > 0 ? selectedDates.value : Object.keys(simpleAssignments.value);

    let openDays = 0;
    let projectedRevenue = 0;
    let conflicts = 0;

    for (const date of dates) {
        if (simpleAssignments.value[date]) {
            openDays++;
            projectedRevenue += projectedRevenueMap.value[date] || 0;

            const isHol = holidayMap.value[date]?.type === 'closed';
            if (isHol) conflicts++;
        }
    }

    return { openDays, projectedRevenue, conflicts };
});

// --- Actions ---

const selectTool = (id: string) => {
  activeToolProfileId.value = activeToolProfileId.value === id ? null : id;
};

const updateAssignment = (date: string, profileId: string | undefined) => {
  const newAssignments = { ...calendar.value.assignments };
  
  if (profileId === undefined) {
    delete newAssignments[date];
  } else {
    // Validation
    if (holidayMap.value[date]?.type === 'closed') {
         console.warn("Assigning to holiday");
    }
    newAssignments[date] = { status: 'open', profile_id: profileId };
  }
  
  emit("update:modelValue", {
    ...props.modelValue,
    calendar: {
      ...calendar.value,
      assignments: newAssignments
    }
  });
};

const handleSelectDate = ({ date, multi }: { date: string; multi: boolean }) => {
  if (multi) {
    if (selectedDates.value.includes(date)) {
      selectedDates.value = selectedDates.value.filter(d => d !== date);
    } else {
      selectedDates.value.push(date);
    }
  } else {
    selectedDates.value = [date];
  }
};

const handlePaintRange = ({ start, end }: { start: string; end: string }) => {
  if (!activeToolProfileId.value) return;
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  const newAssignments = { ...calendar.value.assignments };
  
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    newAssignments[iso] = { status: 'open', profile_id: activeToolProfileId.value };
  }

  emit("update:modelValue", {
    ...props.modelValue,
    calendar: {
      ...calendar.value,
      assignments: newAssignments
    }
  });
};

const handleClearSelection = () => {
    if (selectedDates.value.length > 0) {
        const newAssignments = { ...calendar.value.assignments };
        selectedDates.value.forEach(d => delete newAssignments[d]);
        emit("update:modelValue", {
            ...props.modelValue,
            calendar: {
                ...calendar.value,
                assignments: newAssignments
            }
        });
    }
    selectedDates.value = [];
};

const handleClearDay = (date: string) => updateAssignment(date, undefined);

const handleApplyBulk = (profileId: string) => {
    if (!profileId || selectedDates.value.length === 0) return;

    const newAssignments = { ...calendar.value.assignments };
    selectedDates.value.forEach(d => {
        newAssignments[d] = { status: 'open', profile_id: profileId };
    });
    emit("update:modelValue", {
        ...props.modelValue,
        calendar: {
            ...calendar.value,
            assignments: newAssignments
        }
    });
};

const handleClearBulk = () => {
    handleClearSelection();
};

const handleSmartFill = ({ profileId, days }: { profileId: string; days: string[] }) => {
    const start = new Date(calendar.value.range.start);
    const end = new Date(calendar.value.range.end);
    const newAssignments = { ...calendar.value.assignments };
    const dayMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const targetDays = days.map(d => dayMap[d]);

    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        if (targetDays.includes(d.getDay())) {
            const iso = d.toISOString().slice(0, 10);
            newAssignments[iso] = { status: 'open', profile_id: profileId };
        }
    }

    emit("update:modelValue", {
        ...props.modelValue,
        calendar: {
            ...calendar.value,
            assignments: newAssignments
        }
    });
};

const handleCopyDay = (date: string) => {
    const pid = simpleAssignments.value[date];
    if (pid) clipboardProfileId.value = pid;
};

const handlePasteDay = (date: string) => {
    if (clipboardProfileId.value) {
        updateAssignment(date, clipboardProfileId.value);
    }
};

const handleContextMenu = ({ event, date }: { event: MouseEvent; date: string }) => {
    contextMenu.value = { x: event.clientX, y: event.clientY, date };
};

const handlePreviewDay = (date: string) => {
    selectedDates.value = [date];
    isInspectorOpen.value = true;
};

const handleLockDay = (date: string) => {
    console.log("Lock not fully implemented in schema yet");
};

const handleApplyHoliday = (date: string) => {
    console.log("Manual holiday override not fully implemented");
};

const handleExtendRange = (direction: 'future' | 'past') => {
    if (direction === 'future') {
        const currentEnd = new Date(calendar.value.range.end);
        currentEnd.setDate(currentEnd.getDate() + 28);
        const newEnd = currentEnd.toISOString().slice(0, 10);

        emit("update:modelValue", {
            ...props.modelValue,
            calendar: {
                ...calendar.value,
                range: {
                    ...calendar.value.range,
                    end: newEnd
                }
            }
        });
    }
};

const printSchedule = () => {
    window.print();
};

const openTvMode = () => {
    // Open in new tab
    const url = router.resolve({ path: '/admin/operations/schedule/tv' }).href;
    window.open(url, '_blank');
};
</script>

<style scoped>
@media print {
  .flex-none, .h-12 {
    display: none;
  }
}
</style>
