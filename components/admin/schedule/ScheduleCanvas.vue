<template>
  <div 
    class="h-full flex flex-col relative outline-none bg-base"
    tabindex="0"
    @mouseup="endPaint" 
    @mouseleave="onMouseLeaveCanvas"
    @keydown="handleKeyDown"
  >
    <!-- Sticky Header -->
    <div class="grid grid-cols-7 border-b border-divider bg-surface z-20 sticky top-0 shadow-sm">
      <div
        v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
        :key="day"
        class="py-2 text-center text-xs font-bold text-tertiary uppercase tracking-widest"
      >
        {{ day }}
      </div>
    </div>

    <!-- Virtual List Container -->
    <div
        v-bind="containerProps"
        class="flex-1 overflow-y-auto overflow-x-hidden bg-base"
        @scroll="onScroll"
    >
      <div v-bind="wrapperProps">
          <div
            v-for="week in list"
            :key="week.index"
            class="grid grid-cols-7 border-b border-divider bg-surface min-h-[120px]"
            :style="{ height: itemHeight + 'px' }"
          >
            <div
              v-for="day in week.data.days"
              :key="day.dateStr"
              class="relative border-r border-divider last:border-r-0 select-none cursor-pointer"
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
                :is-holiday="!!holidays?.[day.dateStr]"
                :is-closed="holidays?.[day.dateStr]?.type === 'closed'"
                :view-mode="viewMode"
                :projected-revenue="revenue?.[day.dateStr]"
                :staffing-status="staffing?.[day.dateStr]?.status"
                :staffing-ready="staffing?.[day.dateStr]?.status === 'ok'"
              />
              
              <!-- Month Label Overlay (First day of month) -->
              <div
                v-if="day.dateStr.endsWith('-01')"
                class="absolute top-1 right-2 pointer-events-none z-10"
              >
                <span class="text-[40px] font-black text-primary/5 leading-none select-none">
                  {{ getMonthLabel(day.dateStr) }}
                </span>
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useVirtualList, useThrottleFn } from "@vueuse/core";
import ScheduleDayCard from "./ScheduleDayCard.vue";

const props = defineProps<{
  dateRange: { start: string; end: string };
  assignments: Record<string, string>; // date -> profileId
  profiles: any[];
  selectedDates: string[];
  activeToolProfileId: string | null;
  viewMode?: 'standard' | 'heatmap' | 'staffing';
  // Real Data
  revenue?: Record<string, number>;
  staffing?: Record<string, { required: number; scheduled: number; missing: number; status: 'ok'|'short'|'unknown' }>;
  holidays?: Record<string, { name: string; type: 'closed'|'special' }>;
}>();

const emit = defineEmits(["select-date", "paint-range", "open-inspector", "clear-selection", "copy-day", "paste-day", "context-menu", "preview-day", "extend-range"]);

// 1. Generate Weeks
const weeks = computed(() => {
  const start = new Date(props.dateRange.start);
  const end = new Date(props.dateRange.end);
  const result = [];
  
  // Align start to previous Monday if needed
  const current = new Date(start);
  const day = current.getDay();
  // JS getDay(): Sun=0, Mon=1...Sat=6 -> Mon=1
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);

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
const itemHeight = 140;
const { list, containerProps, wrapperProps } = useVirtualList(weeks, {
  itemHeight,
  overscan: 5,
});

// Scroll Handling for Infinite Grid
const onScroll = useThrottleFn((e: Event) => {
    const target = e.target as HTMLElement;

    // Check bottom
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 600) {
        emit('extend-range', 'future');
    }
}, 200);

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
    return props.profiles.find(p => p.id === props.activeToolProfileId);
  }
  return undefined;
};

const isSelected = (dateStr: string) => props.selectedDates.includes(dateStr);

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
  if (!props.selectedDates.includes(dateStr)) {
    emit("select-date", { date: dateStr, multi: false });
  }
  emit("context-menu", { event, date: dateStr });
};

const onDoubleClick = (dateStr: string) => {
  emit("preview-day", dateStr);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (props.selectedDates.length === 0) return;
  
  const current = props.selectedDates[props.selectedDates.length - 1];
  const dateObj = new Date(current);
  
  const moveDate = (days: number) => {
    e.preventDefault();
    const newDate = new Date(dateObj);
    newDate.setDate(newDate.getDate() + days);
    const newDateStr = newDate.toISOString().slice(0, 10);
    emit("select-date", { date: newDateStr, multi: e.shiftKey });
  };

  switch (e.key) {
    case "ArrowRight": moveDate(1); break;
    case "ArrowLeft": moveDate(-1); break;
    case "ArrowDown": moveDate(7); break;
    case "ArrowUp": moveDate(-7); break;
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
