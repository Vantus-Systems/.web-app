<template>
  <div 
    class="h-full flex flex-col relative outline-none" 
    tabindex="0"
    @mouseup="endPaint" 
    @mouseleave="onMouseLeaveCanvas"
    @keydown="handleKeyDown"
  >
    <!-- Sticky Header -->
    <div class="grid grid-cols-7 border-b border-slate-200 bg-white z-20 sticky top-0 shadow-sm">
      <div
        v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
        :key="day"
        class="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest"
      >
        {{ day }}
      </div>
    </div>

    <!-- Virtual List Container -->
    <div ref="container" class="flex-1 overflow-y-auto overflow-x-hidden bg-slate-100">
      <div v-bind="containerProps" :style="{ height: totalHeight + 'px', position: 'relative' }">
        <div v-bind="wrapperProps">
          <div
            v-for="week in list"
            :key="week.index"
            class="grid grid-cols-7 border-b border-slate-200 bg-white min-h-[120px]"
            :style="{ height: itemHeight + 'px' }"
          >
            <div
              v-for="day in week.data.days"
              :key="day.dateStr"
              class="relative border-r border-slate-100 last:border-r-0 select-none cursor-pointer"
              @mousedown="startPaint(day.dateStr, $event)"
              @mouseenter="onMouseEnter(day.dateStr)"
              @contextmenu.prevent="onContextMenu(day.dateStr, $event)"
              @dblclick="onDoubleClick(day.dateStr)"
            >
              <ScheduleDayCard
                :date="day.dateStr"
                :day-of-week="day.dayOfWeek"
                :profile="getProfile(day.dateStr)"
                :ghost-profile="getGhostProfile(day.dateStr)"
                :is-selected="isSelected(day.dateStr) || isInDataRange(day.dateStr)"
                :is-holiday="isHoliday(day.dateStr)"
                :view-mode="viewMode"
              />
              
              <!-- Month Label Overlay (First day of month) -->
              <div
                v-if="day.dateStr.endsWith('-01')"
                class="absolute top-1 right-2 pointer-events-none z-10"
              >
                <span class="text-[40px] font-black text-slate-900/5 leading-none select-none">
                  {{ getMonthLabel(day.dateStr) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useVirtualList } from "@vueuse/core";
import ScheduleDayCard from "./ScheduleDayCard.vue";

const props = defineProps<{
  dateRange: { start: string; end: string };
  assignments: Record<string, string>; // date -> profileId
  profiles: any[];
  selectedDates: string[];
  activeToolProfileId: string | null;
  viewMode?: 'standard' | 'heatmap' | 'staffing';
}>();

const emit = defineEmits(["select-date", "paint-range", "open-inspector", "clear-selection", "copy-day", "paste-day", "context-menu", "preview-day"]);

// 1. Generate Weeks
const weeks = computed(() => {
  const start = new Date(props.dateRange.start);
  const end = new Date(props.dateRange.end);
  const result = [];
  
  // Align start to previous Monday if needed
  const current = new Date(start);
  const day = current.getDay();
  // JS getDay(): Sun=0, Mon=1...Sat=6
  // We want Monday start.
  // If Sun(0) -> -6 days to get prev Mon
  // If Mon(1) -> 0 days
  // If Tue(2) -> -1 days
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);

  // We loop until we pass the end date
  // Safety break
  let safety = 0;
  while (current <= end || (current > end && current.getDay() !== 1) && safety < 5000) {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      
      weekDays.push({
        dateStr,
        dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][current.getDay()],
      });
      current.setDate(current.getDate() + 1);
    }
    result.push({ days: weekDays });
    safety++;
  }
  return result;
});

// 2. Virtualization
const itemHeight = 140; // Fixed height for consistency
const { list, containerProps, wrapperProps } = useVirtualList(weeks, {
  itemHeight,
  overscan: 5,
});

const totalHeight = computed(() => weeks.value.length * itemHeight);

// 3. Helpers
const getProfile = (dateStr: string) => {
  const pid = props.assignments[dateStr];
  if (!pid) return undefined;
  return props.profiles.find(p => p.id === pid);
};

// Ghost State Logic
const hoverDate = ref<string | null>(null);

const getGhostProfile = (dateStr: string) => {
  if (dateStr === hoverDate.value && props.activeToolProfileId && !isPainting.value) {
    // Only show ghost if slot is empty or we want to show override
    // Assuming overwrite behavior, so always show ghost
    return props.profiles.find(p => p.id === props.activeToolProfileId);
  }
  return undefined;
};

const isSelected = (dateStr: string) => props.selectedDates.includes(dateStr);
const isHoliday = (dateStr: string) => {
  // Simple check for now, can be expanded
  const [y, m, d] = dateStr.split("-");
  return (m === "12" && d === "25") || (m === "01" && d === "01") || (m === "07" && d === "04");
};

const getMonthLabel = (dateStr: string) => {
  const [y, m] = dateStr.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("default", { month: "short" }).toUpperCase();
};

// 4. Paint / Drag Logic
const isPainting = ref(false);
const dragStart = ref<string | null>(null);
const dragCurrent = ref<string | null>(null);

const startPaint = (dateStr: string, event: MouseEvent) => {
  if (event.shiftKey || !props.activeToolProfileId) {
    // Selection Mode
    emit("select-date", { date: dateStr, multi: event.shiftKey || event.metaKey });
    return;
  }
  
  // Paint Mode
  isPainting.value = true;
  dragStart.value = dateStr;
  dragCurrent.value = dateStr;
};

const onMouseEnter = (dateStr: string) => {
  hoverDate.value = dateStr;
  if (isPainting.value) {
    dragCurrent.value = dateStr;
  }
};

const onMouseLeaveCanvas = () => {
  hoverDate.value = null;
  endPaint();
};

const endPaint = () => {
  if (isPainting.value && dragStart.value && dragCurrent.value) {
    // Determine range
    const start = dragStart.value < dragCurrent.value ? dragStart.value : dragCurrent.value;
    const end = dragStart.value < dragCurrent.value ? dragCurrent.value : dragStart.value;
    
    emit("paint-range", { start, end });
  }
  isPainting.value = false;
  dragStart.value = null;
  dragCurrent.value = null;
};

const isInDataRange = (dateStr: string) => {
  if (!isPainting.value || !dragStart.value || !dragCurrent.value) return false;
  const start = dragStart.value < dragCurrent.value ? dragStart.value : dragCurrent.value;
  const end = dragStart.value < dragCurrent.value ? dragCurrent.value : dragStart.value;
  return dateStr >= start && dateStr <= end;
};

// 5. Interaction Handlers
const onContextMenu = (dateStr: string, event: MouseEvent) => {
  // If date not in selection, select it first
  if (!props.selectedDates.includes(dateStr)) {
    emit("select-date", { date: dateStr, multi: false });
  }
  emit("context-menu", { event, date: dateStr });
};

const onDoubleClick = (dateStr: string) => {
  emit("preview-day", dateStr);
};

const handleKeyDown = (e: KeyboardEvent) => {
  // We need a reference date. If selection exists, use the last one. If not, ignore or use today.
  if (props.selectedDates.length === 0) return;
  
  const current = props.selectedDates[props.selectedDates.length - 1];
  const dateObj = new Date(current);
  
  // Helper to offset date
  const moveDate = (days: number) => {
    e.preventDefault();
    const newDate = new Date(dateObj);
    newDate.setDate(newDate.getDate() + days);
    const newDateStr = newDate.toISOString().slice(0, 10);
    emit("select-date", { date: newDateStr, multi: e.shiftKey });
  };

  switch (e.key) {
    case "ArrowRight":
      moveDate(1);
      break;
    case "ArrowLeft":
      moveDate(-1);
      break;
    case "ArrowDown":
      moveDate(7);
      break;
    case "ArrowUp":
      moveDate(-7);
      break;
    case "Enter":
      e.preventDefault();
      emit("open-inspector");
      break;
    case "Backspace":
    case "Delete":
      e.preventDefault();
      emit("clear-selection");
      break;
    case "c":
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        emit("copy-day", current);
      }
      break;
    case "v":
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        emit("paste-day", current);
      }
      break;
  }
};
</script>
