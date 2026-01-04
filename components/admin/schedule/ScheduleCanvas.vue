<template>
  <div 
    class="h-full flex flex-col relative outline-none bg-base" 
    tabindex="0"
    @mouseup="endPaint" 
    @mouseleave="endPaint"
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

    <!-- Scroll Container -->
    <div ref="scrollContainer" v-bind="containerProps" class="flex-1 overflow-y-auto overflow-x-hidden bg-base custom-scrollbar">
      <!-- Top Loader Trigger -->
      <div ref="topTrigger" class="h-4 w-full"></div>

      <div v-if="weeks.length === 0" class="flex items-center justify-center h-full text-secondary">
        No dates in range
      </div>

      <div v-else class="relative" v-bind="wrapperProps">
         <!-- Virtual List -->
         <div
            v-for="{ data: week, index: wIdx } in list"
            :key="week.startDate"
            class="grid grid-cols-7 border-b border-divider bg-surface min-h-[140px] h-[140px]"
         >
            <div
              v-for="day in week.days"
              :key="day.dateStr"
              class="relative border-r border-divider last:border-r-0 select-none group"
              :class="{
                'bg-accent-primary/5 ring-inset ring-2 ring-accent-primary/20': isSelected(day.dateStr),
                'cursor-crosshair': activeToolProfileId,
                'cursor-pointer': !activeToolProfileId
              }"
              @mousedown.left="startPaint(day.dateStr, $event)"
              @mouseenter="onMouseEnter(day.dateStr)"
              @contextmenu.prevent="onContextMenu(day.dateStr, $event)"
              @dblclick="onDoubleClick(day.dateStr)"
            >
              <ScheduleDayCard
                :date="day.dateStr"
                :day-of-week="day.dayOfWeek"
                :assignment="getEffectiveAssignment(day.dateStr)"
                :profile="getProfile(day.dateStr)"
                :ghost-profile="getGhostProfile(day.dateStr)"
                :is-selected="isSelected(day.dateStr)"
                :is-holiday="isHoliday(day.dateStr)"
                :holiday-info="getHoliday(day.dateStr)"
                :shifts="getShiftsForDate(day.dateStr)"
                :has-conflict="hasConflict(day.dateStr)"
                :view-mode="viewMode"
                @preview="emit('preview-day', day.dateStr)"
              />
              
              <!-- Month Label Overlay (First day of month) -->
              <div
                v-if="day.dateStr.endsWith('-01')"
                class="absolute top-2 right-2 pointer-events-none z-10"
              >
                <span class="text-3xl font-black text-primary/5 leading-none select-none">
                  {{ getMonthLabel(day.dateStr) }}
                </span>
              </div>
            </div>
         </div>
      </div>

      <!-- Bottom Loader Trigger -->
      <div ref="bottomTrigger" class="h-4 w-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useInfiniteScroll, useKeyModifier, useVirtualList } from "@vueuse/core";
import ScheduleDayCard from "./ScheduleDayCard.vue";
import { dateKey, resolveEffectiveAssignment, parseDateKey, addDays } from "~/utils/schedule-calendar";
import type { OpsSchemaCalendarAssignment, OpsSchemaCalendarOverride, OpsSchemaDayProfile } from "~/types/ops-schema";

const props = defineProps<{
  range: { start: string; end: string };
  weekdayDefaults: Record<string, OpsSchemaCalendarAssignment>;
  assignments: Record<string, OpsSchemaCalendarAssignment>;
  overrides: Record<string, OpsSchemaCalendarOverride[]>;
  profiles: OpsSchemaDayProfile[];
  holidays: any[];
  shifts?: any[];
  selectedDates: string[];
  activeToolProfileId: string | null;
  viewMode?: 'standard' | 'heatmap' | 'staffing';
}>();

const emit = defineEmits([
  "select-date", "paint-range", "open-inspector", 
  "clear-selection", "copy-day", "paste-day", 
  "context-menu", "preview-day", "extend-range",
  "clear-tool", "clear-selection-content"
]);

// --- Infinite Scroll Triggers ---
const scrollContainer = ref<HTMLElement | null>(null);
const topTrigger = ref<HTMLElement | null>(null);
const bottomTrigger = ref<HTMLElement | null>(null);

// Custom Intersection Observer for Top/Bottom with throttling
let observer: IntersectionObserver;
const lastExtend = ref(0);
const EXTEND_COOLDOWN = 1000;

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const now = Date.now();
    if (now - lastExtend.value < EXTEND_COOLDOWN) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === topTrigger.value) {
           lastExtend.value = Date.now();
           emit('extend-range', 'start');
        } else if (entry.target === bottomTrigger.value) {
           lastExtend.value = Date.now();
           emit('extend-range', 'end');
        }
      }
    });
  }, { root: scrollContainer.value, rootMargin: '200px' });

  if (topTrigger.value) observer.observe(topTrigger.value);
  if (bottomTrigger.value) observer.observe(bottomTrigger.value);
});

watch(() => props.range.start, async (newVal, oldVal) => {
  if (newVal !== oldVal && scrollContainer.value) {
    const oldHeight = scrollContainer.value.scrollHeight;
    const oldTop = scrollContainer.value.scrollTop;
    
    await nextTick();
    
    const newHeight = scrollContainer.value.scrollHeight;
    // Maintain relative scroll position when adding to top
    if (newVal < oldVal) {
       scrollContainer.value.scrollTop = oldTop + (newHeight - oldHeight);
    }
  }
});

// --- Data Generation ---

const weeks = computed(() => {
  const result = [];
  
  // Align start to previous Monday using UTC
  const startD = parseDateKey(props.range.start);
  const day = startD.getUTCDay(); // 0=Sun, 1=Mon...
  // We want Monday start (1).
  const diff = day === 0 ? -6 : 1 - day;
  
  let currentStr = addDays(props.range.start, diff);
  const endStr = props.range.end;

  // Loop week by week
  while (currentStr <= endStr) {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push({
        dateStr: currentStr,
        dayOfWeek: i // 0=Mon, 1=Tue... logic for display? No, let's keep it simple.
      });
      currentStr = addDays(currentStr, 1);
    }
    result.push({
      startDate: weekDays[0].dateStr,
      days: weekDays
    });
  }
  return result;
});

// Virtual List
const { list, containerProps, wrapperProps } = useVirtualList(
  weeks,
  {
    itemHeight: 140, // Fixed height per requirement
    overscan: 5,
  }
);

// --- Interactions ---
const isPainting = ref(false);
const paintStartKey = ref<string | null>(null);
const shiftPressed = useKeyModifier('Shift');
const anchorDate = ref<string | null>(null);
const activeHoverDate = ref<string | null>(null);

const startPaint = (date: string, event: MouseEvent) => {
  if (event.button !== 0) return; // Left click only
  
  isPainting.value = true;
  paintStartKey.value = date;

  if (props.activeToolProfileId) {
    // Tool selected: Paint immediately
    emit('paint-range', { dates: [date], profileId: props.activeToolProfileId });
  } else {
    // Selection mode
    if (event.shiftKey) {
      // Toggle day in selection (multi-select)
      // Prompt says "Shift+click (no tool): toggles day in selection"
      emit('select-date', { date, multi: true });
      anchorDate.value = date;
    } else if (event.ctrlKey || event.metaKey) {
      // Standard multi-select toggle usually cmd-click, but prompt requested shift for toggle?
      // "Shift+click (no tool): toggles day in selection"
      // Wait, standard is usually Shift=Range, Cmd=Toggle.
      // Prompt: "Shift+click (no tool): toggles day in selection (multi-select)."
      // "Click (no tool): selects that day. Click again clears selection."
      // "Drag (no tool): selects a contiguous date range".

      // I will implement prompt requests:
      // Shift+Click -> Toggle
      // Click -> Select Single / Clear if same

      // But also commonly Cmd/Ctrl is toggle. I'll support both for toggle if user wants?
      // Prompt: "Shift+click... toggles".

      emit('select-date', { date, multi: true });
      anchorDate.value = date;
    } else {
      // Single Click
      // "Click (no tool selected): selects that day. Click again clears selection."
      const alreadySelected = props.selectedDates.length === 1 && props.selectedDates.includes(date);
      if (alreadySelected) {
         emit('clear-selection');
         anchorDate.value = null;
      } else {
         emit('select-date', { date, multi: false });
         anchorDate.value = date;
      }
    }
  }
};

const onMouseEnter = (date: string) => {
  activeHoverDate.value = date;

  if (!isPainting.value || !paintStartKey.value) return;

  if (props.activeToolProfileId) {
    // Drag with tool: Paint range from start to current
    // "Drag (tool selected): paints a contiguous date range from drag start -> current hover... and applies ON mouseup."
    // Wait, prompt said: "applies ON mouseup".
    // "live visual feedback".
    // So I should NOT emit 'paint-range' here yet?
    // But currently I don't have a "preview paint" mechanism in OpsSchemaCalendarEditor.
    // OpsSchemaCalendarEditor `handlePaintRange` applies assignment.
    // If I want "live visual feedback" but "apply ON mouseup", I need a local preview state in ScheduleCanvas.
    // I will assume "live visual feedback" means "select them" or "show ghost"?
    // "with live visual feedback".
    // If I paint immediately, it applies immediately.
    // "applies ON mouseup" implies batching.
    // To support this properly, I would need a `previewAssignments` prop or similar.
    // Or I can misuse selection to show the range?
    // Let's implement immediate paint for now as "live feedback" because refactoring the whole data flow for preview is risky.
    // Wait, "applies ON mouseup" is explicit.
    // If I paint immediately, I create many undo steps / network requests if not debounced.
    // I will USE SELECTION to show the range during drag, and paint on mouseup.
    // This gives visual feedback (selection highlight) and single commit.
    // But selection color is blue, paint is profile color.
    // Users might find it confusing if they don't see the profile color.
    // I will use a local `ghostPaintRange` state.
  } else {
    // Drag no tool: Select range
    // "Drag (no tool): selects a contiguous date range from drag start -> current hover, with live highlight, and sets selectedDates to exactly that range on mouseup."
    // Wait, "sets selectedDates... on mouseup".
    // "live highlight".
    // Does it mean I shouldn't update `selectedDates` until mouseup?
    // "selects a contiguous date range... with live highlight".
    // I can update `selectedDates` live, provided `OpsSchemaCalendarEditor` handles it fast enough.
    // Given the prompt "sets selectedDates to exactly that range on mouseup", it implies potentially separation.
    // But if I update `selectedDates` live, I achieve "live highlight" easily.
    // I will update live.
    const range = getRange(paintStartKey.value, date);
    emit('select-date', { date: range, multi: false, replace: true });
  }
};

const endPaint = () => {
  if (isPainting.value && paintStartKey.value && activeHoverDate.value) {
     if (props.activeToolProfileId) {
        // Paint on mouseup
        const range = getRange(paintStartKey.value, activeHoverDate.value);
        emit('paint-range', { dates: range, profileId: props.activeToolProfileId });
     }
     // Selection was updated live, so nothing to do.
  }
  isPainting.value = false;
  paintStartKey.value = null;
  activeHoverDate.value = null;
};

// --- Range Helpers ---
const getRange = (start: string, end: string) => {
  const d1 = parseDateKey(start);
  const d2 = parseDateKey(end);
  const result = [];
  
  // Determine min/max
  const startTime = d1.getTime();
  const endTime = d2.getTime();
  const min = startTime < endTime ? d1 : d2;
  const max = startTime < endTime ? d2 : d1;
  
  let curr = new Date(min);
  while (curr <= max) {
    result.push(dateKey(curr));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return result;
};

const onContextMenu = (date: string, event: MouseEvent) => {
  emit('context-menu', { x: event.clientX, y: event.clientY, date });
};

const onDoubleClick = (date: string) => {
  emit('open-inspector', date);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
     emit('clear-selection');
     emit('clear-tool');
  } else if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
    if (props.selectedDates.length > 0) {
      emit('copy-day', props.selectedDates[props.selectedDates.length - 1]);
    }
  } else if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
    if (props.selectedDates.length > 0) {
      // Paste to ALL selected dates or just active? Prompt said "paste clipboard profile id onto the active date (or all selected if you choose)".
      // Consistent with context menu "Paste" which pastes to active date, or if multiple selected?
      // I'll paste to active date (last selected) for safety.
      emit('paste-day', props.selectedDates[props.selectedDates.length - 1]);
    }
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    emit('clear-selection-content');
  }
};

// --- Helpers ---

const getEffectiveAssignment = (date: string) => {
  return resolveEffectiveAssignment({
    weekdayDefaults: props.weekdayDefaults,
    assignments: props.assignments,
    overrides: props.overrides,
    range: props.range
  } as any, date);
};

const getProfile = (date: string): OpsSchemaDayProfile | undefined => {
  const eff = getEffectiveAssignment(date);
  if (eff.effectiveProfileId) {
    return props.profiles.find(p => p.id === eff.effectiveProfileId);
  }
  return undefined;
};

const getGhostProfile = (date: string): OpsSchemaDayProfile | undefined => {
  if (isPainting.value && props.activeToolProfileId && paintStartKey.value && activeHoverDate.value) {
     const range = getRange(paintStartKey.value, activeHoverDate.value);
     if (range.includes(date)) {
        return props.profiles.find(p => p.id === props.activeToolProfileId);
     }
  } else if (activeHoverDate.value === date && props.activeToolProfileId) {
      return props.profiles.find(p => p.id === props.activeToolProfileId);
  }
  return undefined;
};

const isSelected = (date: string) => {
  return props.selectedDates.includes(date);
};

const isHoliday = (date: string) => {
  return props.holidays.some(h => h.date === date);
};

const getHoliday = (date: string) => {
  return props.holidays.find(h => h.date === date);
};

const shiftsByDate = computed(() => {
  if (!props.shifts) return new Map();
  const map = new Map();
  props.shifts.forEach(shift => {
    const date = shift.date.split('T')[0];
    if (!map.has(date)) {
      map.set(date, []);
    }
    map.get(date).push(shift);
  });
  return map;
});

const getShiftsForDate = (date: string) => {
  return shiftsByDate.value.get(date) || [];
};

const hasConflict = (date: string) => {
  const holiday = getHoliday(date);
  if (!holiday) return false;
  if (holiday.closureType !== 'CLOSED') return false;
  
  const eff = getEffectiveAssignment(date);
  return eff.status === 'open';
};

const getMonthLabel = (date: string) => {
  const parts = date.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d_str = parts[2];
  
  if (!y || !m || !d_str) {
    return '';
  }
  
  const localDate = new Date(y, m - 1, d_str);
  return localDate.toLocaleDateString(undefined, { month: 'long' });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(110, 110, 115, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(110, 110, 115, 0.8);
}
</style>
