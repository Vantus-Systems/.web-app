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
                'bg-accent-primary/5': isSelected(day.dateStr),
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
        lastExtend.value = Date.now();
        if (entry.target === topTrigger.value) {
          emit('extend-range', 'start');
        } else if (entry.target === bottomTrigger.value) {
          emit('extend-range', 'end');
        }
      }
    });
  }, { root: scrollContainer.value, rootMargin: '200px' });

  if (topTrigger.value) observer.observe(topTrigger.value);
  if (bottomTrigger.value) observer.observe(bottomTrigger.value);
});

watch(() => props.range.start, async (newVal, oldVal) => {
  if (newVal !== oldVal && container.value) {
    const oldHeight = container.value.scrollHeight;
    const oldTop = container.value.scrollTop;
    
    await nextTick();
    
    const newHeight = container.value.scrollHeight;
    container.value.scrollTop = oldTop + (newHeight - oldHeight);
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

const startPaint = (date: string, event: MouseEvent) => {
  if (event.button !== 0) return; // Left click only
  
  // If tool is selected, we are painting.
  if (props.activeToolProfileId) {
    isPainting.value = true;
    paintStartKey.value = date;
    // Paint immediately
    emit('paint-range', { dates: [date], profileId: props.activeToolProfileId });
  } else {
    // Selection mode
    isPainting.value = true;
    paintStartKey.value = date;
    
    if (shiftPressed.value && anchorDate.value) {
      // Range select from anchor to date
      selectRange(anchorDate.value, date);
    } else {
      if (event.ctrlKey || event.metaKey) {
        // Toggle single
        emit('select-date', { date, multi: true });
        anchorDate.value = date; // Update anchor
      } else {
        // Single select (clear others)
        // If already selected and no modifier, clicking might just select this one.
        // Wait, "Click (no tool selected): selects that day... Click again clears".
        // If we click a new day, we select it and clear others.
        // If we click the same day, we toggle it off?
        const alreadySelected = props.selectedDates.includes(date) && props.selectedDates.length === 1;
        if (alreadySelected) {
           emit('select-date', { date, multi: true }); // Toggle logic in parent will remove it
           anchorDate.value = null;
        } else {
           // Select just this one
           // We need a way to clear others first. Parent 'select-date' with multi=false handles "toggle selection" if clicked same, or "select [date]" if new.
           // But if we want to clear others and select this one:
           // Parent logic: "multi=false... if includes -> [] else -> [date]"
           // This matches "Click again clears selection".
           emit('select-date', { date, multi: false });
           anchorDate.value = date;
        }
      }
    }
  }
};

const onMouseEnter = (date: string) => {
  if (!isPainting.value || !paintStartKey.value) return;

  if (props.activeToolProfileId) {
    // Painting drag
    // Paint this date if not already painted in this drag?
    // We want "contiguous date range from drag start -> current hover".
    // But we are painting *live*.
    // So we should paint the range from paintStartKey to date.
    // And we need to avoid repainting or spamming.
    // Ideally we just emit 'paint-range' for the new dates.
    // For simplicity, let's just paint the current hovered date if different?
    // No, fast drag might skip dates.
    // We should compute range [paintStartKey, date] and paint all.
    const range = getRange(paintStartKey.value, date);
    emit('paint-range', { dates: range, profileId: props.activeToolProfileId });
  } else {
    // Selection drag
    // "selects a contiguous date range from drag start -> current hover"
    // We should update selection to be exactly this range.
    // But we need to keep what was selected before if Ctrl?
    // Requirement: "Drag (no tool): selects a contiguous date range from drag start -> current hover... and sets selectedDates to exactly that range on mouseup."
    // "Live highlight" means we should update selectedDates live.
    // So we replace selection with [start...current].
    const range = getRange(paintStartKey.value, date);
    // We need to emit a set-selection event?
    // 'select-date' isn't enough.
    // We reuse 'select-date' with a new payload or emit a new event?
    // Parent `handleDateSelection` does: multi ? append/remove : toggle/set.
    // We need "Replace Selection".
    // I'll emit 'clear-selection' then 'select-date' loop? No, that's flashy.
    // I will add a new event `set-selection` to ScheduleCanvas and OpsSchemaCalendarEditor?
    // Or just abuse `select-date`?
    // OpsSchemaCalendarEditor `handleDateSelection` logic:
    // if (!multi) { if includes ? [] : [date] }
    // This is for click.
    // For drag, we need to override `selectedDates`.
    // I will modify `OpsSchemaCalendarEditor` to accept `set-selection` event or modify `handleDateSelection` to accept a list.
    emit('select-date', { date: range, multi: false, replace: true });
  }
};

const endPaint = () => {
  isPainting.value = false;
  paintStartKey.value = null;
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

const selectRange = (start: string, end: string) => {
    const range = getRange(start, end);
    // Emit replace
    emit('select-date', { date: range, multi: false, replace: true });
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
     // Also clear active tool - we need to tell parent to clear selectedProfileId
     // We can reuse 'clear-selection' for both? Or parent needs to know.
     // Parent `handleBulkClear` just clears dates.
     // I need a way to clear tool.
     // I will emit a new event 'clear-tool'.
     emit('clear-tool');
  } else if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
    if (props.selectedDates.length > 0) {
      emit('copy-day', props.selectedDates[props.selectedDates.length - 1]);
    }
  } else if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
    // Paste to active date (last selected)
    if (props.selectedDates.length > 0) {
      emit('paste-day', props.selectedDates[props.selectedDates.length - 1]);
    }
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    emit('clear-selection-content'); // New event to clear assignments
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
  // If hovering with a tool, show ghost?
  // Logic could be complex. Skip for now or implement if easy.
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
    const date = shift.date.split('T')[0]; // Extract date part
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
  // Conflict if OPEN on a CLOSED holiday
  const holiday = getHoliday(date);
  if (!holiday) return false;
  if (holiday.closureType !== 'CLOSED') return false; // Partial close might be ok
  
  const eff = getEffectiveAssignment(date);
  return eff.status === 'open';
};

const getMonthLabel = (date: string) => {
  const d = new Date(date);
  // Add time zone offset to ensure correct month display if parsing simplistic?
  // We used dateKey parsing logic which sets time to 00:00 local.
  // parseDateKey in util handles this.
  // But here we have string.
  // new Date(date) parses as UTC if YYYY-MM-DD? No, YYYY-MM-DD is usually UTC in ES5, but local in some browsers?
  // Safe way: split.
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
