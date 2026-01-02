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
    <div ref="container" class="flex-1 overflow-y-auto overflow-x-hidden bg-base custom-scrollbar">
      <!-- Top Loader Trigger -->
      <div ref="topTrigger" class="h-4 w-full"></div>

      <div v-if="weeks.length === 0" class="flex items-center justify-center h-full text-secondary">
        No dates in range
      </div>

      <div v-else class="relative">
         <!-- Virtual List Wrapper is tricky with variable height or dynamic content.
             For now, we render plain list. 1 year = 52 divs. 
             If performance is bad, we switch to virtual. -->
         <div
            v-for="(week, wIdx) in weeks"
            :key="week.startDate"
            class="grid grid-cols-7 border-b border-divider bg-surface min-h-[140px]"
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
import { useInfiniteScroll, useKeyModifier } from "@vueuse/core";
import ScheduleDayCard from "./ScheduleDayCard.vue";
import { dateKey, resolveEffectiveAssignment } from "~/utils/schedule-calendar";
import type { OpsSchemaCalendarAssignment, OpsSchemaCalendarOverride } from "~/types/ops-schema";

const props = defineProps<{
  range: { start: string; end: string };
  weekdayDefaults: Record<string, OpsSchemaCalendarAssignment>;
  assignments: Record<string, OpsSchemaCalendarAssignment>;
  overrides: Record<string, OpsSchemaCalendarOverride[]>;
  profiles: any[];
  holidays: any[];
  shifts?: any[];
  selectedDates: string[];
  activeToolProfileId: string | null;
  viewMode?: 'standard' | 'heatmap' | 'staffing';
}>();

const emit = defineEmits([
  "select-date", "paint-range", "open-inspector", 
  "clear-selection", "copy-day", "paste-day", 
  "context-menu", "preview-day", "extend-range"
]);

// --- Infinite Scroll Triggers ---
const container = ref<HTMLElement | null>(null);
const topTrigger = ref<HTMLElement | null>(null);
const bottomTrigger = ref<HTMLElement | null>(null);

useInfiniteScroll(container, () => {
  // Check scroll position to decide direction
  // But useInfiniteScroll usually triggers when reaching bottom.
  // We need bi-directional.
  // For simplicity, I'll rely on intersection observer on triggers manually if useInfiniteScroll is limited.
  // Actually, standard InfiniteScroll is bottom only.
  // Let's use IntersectionObserver.
}, { distance: 100 });

// Custom Intersection Observer for Top/Bottom
let observer: IntersectionObserver;

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === topTrigger.value) {
          emit('extend-range', 'start');
        } else if (entry.target === bottomTrigger.value) {
          emit('extend-range', 'end');
        }
      }
    });
  }, { root: container.value, rootMargin: '200px' });

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
  const start = new Date(props.range.start);
  const end = new Date(props.range.end);
  const result = [];
  
  // Align start to previous Monday
  const current = new Date(start);
  const day = current.getDay(); // 0=Sun, 1=Mon
  // We want Monday start (1).
  // diff = 1 - day.
  // If Sun(0) -> 1 - 0 = +1 (wrong, need -6).
  // If Mon(1) -> 1 - 1 = 0.
  // If Tue(2) -> 1 - 2 = -1.
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);

  // Loop week by week
  while (current <= end) {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push({
        dateStr: dateKey(current),
        dayOfWeek: i // 0=Mon, 1=Tue... logic for display? No, let's keep it simple.
        // Actually dateKey is enough.
      });
      current.setDate(current.getDate() + 1);
    }
    result.push({
      startDate: weekDays[0].dateStr,
      days: weekDays
    });
  }
  return result;
});

// --- Interactions ---
const isPainting = ref(false);
const paintStartKey = ref<string | null>(null);
const shiftPressed = useKeyModifier('Shift');

const startPaint = (date: string, event: MouseEvent) => {
  if (event.button !== 0) return; // Left click only
  
  isPainting.value = true;
  paintStartKey.value = date;
  
  // Emit selection start
  emit('select-date', { date, multi: shiftPressed.value || props.activeToolProfileId });
};

const onMouseEnter = (date: string) => {
  if (isPainting.value && paintStartKey.value) {
    // We are dragging.
    // Calculate range from start to current.
    // For now, we assume simple selection logic, handled by parent?
    // Parent "handleDateSelection" toggles. Dragging creates a stream of toggles? Bad.
    // We should emit a "range selection" event or accumulate locally.
    // User requested "Paint interactions".
    // I'll emit 'select-date' for each entered cell if it's not already selected?
    // Or better: emit 'paint-range' at the end.
    // But visual feedback is needed.
    // I'll emit 'select-date' with multi=true to add to selection.
    
    // Optimisation: only emit if not in selectedDates.
    if (!props.selectedDates.includes(date)) {
      emit('select-date', { date, multi: true });
    }
  }
};

const endPaint = () => {
  if (isPainting.value) {
    isPainting.value = false;
    paintStartKey.value = null;
    
    // If we have an active tool, we should apply it to the selected dates now?
    // OpsSchemaCalendarEditor handles `handleDateSelection`.
    // If we just finished a drag, the dates are selected.
    // If activeToolProfileId is set, we should paint them.
    if (props.activeToolProfileId && props.selectedDates.length > 0) {
      emit('paint-range', { dates: props.selectedDates, profileId: props.activeToolProfileId });
      // clear selection after paint? Maybe not, keep selected for further edits.
    }
  }
};

const onContextMenu = (date: string, event: MouseEvent) => {
  emit('context-menu', { x: event.clientX, y: event.clientY, date });
};

const onDoubleClick = (date: string) => {
  emit('open-inspector', date);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
    if (props.selectedDates.length > 0) {
      emit('copy-day', props.selectedDates[props.selectedDates.length - 1]);
    }
  } else if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
    if (props.selectedDates.length > 0) {
      emit('paste-day', props.selectedDates[props.selectedDates.length - 1]);
    }
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    emit('clear-selection');
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

const getProfile = (date: string) => {
  const eff = getEffectiveAssignment(date);
  if (eff.effectiveProfileId) {
    return props.profiles.find(p => p.id === eff.effectiveProfileId);
  }
  return null;
};

const getGhostProfile = (date: string) => {
  // If hovering with a tool, show ghost?
  // Logic could be complex. Skip for now or implement if easy.
  return null;
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

const getShiftsForDate = (date: string) => {
  if (!props.shifts) return [];
  return props.shifts.filter(s => s.date.startsWith(date));
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
  const [y, m, d_str] = date.split('-').map(Number);
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
