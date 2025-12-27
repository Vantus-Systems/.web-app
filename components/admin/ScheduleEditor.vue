<template>
  <div class="space-y-4 font-sans text-slate-900">
    <!-- Header / Control Bar -->
    <BaseCard class-name="space-y-4 border-l-4 border-l-gold">
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-3 mb-1">
             <p class="text-gold font-bold text-xs uppercase tracking-[0.3em]">
              Enterprise Command Center
            </p>
            <span v-if="unsavedChanges" class="animate-pulse px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
              Unsaved Changes
            </span>
          </div>
          <h3 class="text-3xl font-black text-primary-950 tracking-tight">
            Schedule Control Room
          </h3>
          <p class="text-sm text-slate-500 font-medium">
             Manage operations, monitor occupancy, and optimize revenue.
          </p>
        </div>

        <!-- Month Navigation & Actions -->
        <div class="flex flex-wrap items-center gap-3">
           <div class="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              <button @click="changeMonth(-1)" class="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-primary-600 transition-colors">
                 <ChevronLeft class="w-5 h-5" />
              </button>
              <div class="px-4 text-center min-w-[140px]">
                 <span class="block text-sm font-black text-primary-900 uppercase tracking-widest">{{ currentMonthName }}</span>
                 <span class="block text-[10px] text-slate-400 font-bold">{{ currentYear }}</span>
              </div>
              <button @click="changeMonth(1)" class="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-primary-600 transition-colors">
                 <ChevronRight class="w-5 h-5" />
              </button>
           </div>

           <div class="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

           <!-- Filter Toggles -->
           <div class="flex items-center gap-2">
              <button
                @click="toggleFilter('drafts')"
                :class="[
                  'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                  filters.showDrafts ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'
                ]"
              >
                Drafts
              </button>
              <button
                @click="toggleFilter('conflicts')"
                :class="[
                  'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                  filters.highlightConflicts ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white text-slate-500 border-slate-200'
                ]"
              >
                Conflicts
              </button>
           </div>

           <div class="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

           <BaseButton
              variant="gold"
              class-name="px-6 py-3 text-xs uppercase tracking-[0.2em] shadow-xl shadow-gold/20"
              type="button"
              :disabled="isSaving"
              @click="saveAll"
            >
              <span v-if="isSaving">Syncing...</span>
              <span v-else>Publish Changes</span>
            </BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Monthly Calendar Grid -->
    <div class="bg-slate-100 rounded-xl p-1 overflow-x-auto shadow-inner">
       <div class="min-w-[1000px] grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          <!-- Weekday Headers -->
          <div v-for="day in weekDays" :key="day" class="bg-white p-3 text-center">
             <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ day }}</span>
          </div>

          <!-- Calendar Days -->
          <div
            v-for="cell in calendarCells"
            :key="cell.dateStr"
            :class="[
                'bg-white min-h-[180px] p-2 transition-colors relative group',
                !cell.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : '',
                cell.isToday ? 'bg-primary-50/30' : ''
            ]"
            @dragover.prevent
            @drop="onDrop($event, cell.dateStr)"
          >
             <!-- Date Header -->
             <div class="flex justify-between items-start mb-2">
                <span
                    :class="[
                        'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full',
                        cell.isToday ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-700'
                    ]"
                >
                    {{ cell.dayNum }}
                </span>
                <button @click="addNewSession(cell.dateStr)" class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-gold transition-opacity">
                    <Plus class="w-4 h-4" />
                </button>
             </div>

             <!-- Conflict Indicator -->
             <div v-if="cell.hasConflict && filters.highlightConflicts" class="mb-2 px-2 py-1 bg-rose-50 border border-rose-100 rounded text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-pulse">
                <AlertTriangle class="w-3 h-3" /> Scheduling Conflict
             </div>

             <!-- Sessions Stack -->
             <div class="space-y-2">
                <div
                    v-for="session in cell.sessions"
                    :key="session.uniqueKey"
                    draggable="true"
                    @dragstart="onDragStart($event, session)"
                    @contextmenu.prevent="openContextMenu($event, session)"
                    :class="[
                        'p-2 rounded-lg border shadow-sm cursor-move transition-all hover:scale-[1.02] relative overflow-hidden',
                        session.isDraft ? 'border-dashed border-slate-300 bg-slate-50 opacity-80' : 'border-slate-200 bg-white hover:border-gold/50',
                        session.hasConflict && filters.highlightConflicts ? 'ring-2 ring-rose-500 ring-offset-1' : ''
                    ]"
                >
                    <!-- Status Bar -->
                    <div :class="['absolute left-0 top-0 bottom-0 w-1', getStatusColor(session.status)]"></div>

                    <div class="pl-2">
                        <div class="flex justify-between items-start">
                             <span class="text-[10px] font-bold text-slate-500">{{ session.startTime }}</span>
                             <span v-if="session.isDraft" class="text-[9px] font-bold bg-slate-200 text-slate-600 px-1 rounded uppercase">Draft</span>
                        </div>

                        <h5 class="text-xs font-bold text-primary-900 leading-tight my-1 truncate">{{ session.name }}</h5>

                        <!-- BI Metrics -->
                        <div class="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                             <div class="flex flex-col">
                                <span class="text-[9px] text-slate-400 uppercase tracking-tighter font-bold">Proj. Rev</span>
                                <span class="text-[10px] font-bold text-emerald-600">${{ formatMoney(session.projectedRevenue) }}</span>
                             </div>
                             <div class="flex-1">
                                <div class="flex justify-between text-[9px] text-slate-400 mb-0.5">
                                    <span>Occ.</span>
                                    <span>{{ session.occupancy }}%</span>
                                </div>
                                <div class="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-primary-500" :style="{ width: session.occupancy + '%' }"></div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
       </div>
    </div>

    <!-- Context Menu -->
    <div
        v-if="contextMenu.visible"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        class="fixed z-50 bg-white rounded-lg shadow-2xl border border-slate-100 w-48 py-1 transform transition-all duration-200 origin-top-left"
        @mouseleave="closeContextMenu"
    >
        <div class="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <p class="text-xs font-bold text-primary-900 truncate">{{ contextMenu.session?.name }}</p>
        </div>
        <button @click="handleContextAction('edit')" class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-gold/10 hover:text-primary-900 flex items-center gap-2">
            <Edit class="w-3 h-3" /> Edit Details
        </button>
        <button @click="handleContextAction('duplicate')" class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-gold/10 hover:text-primary-900 flex items-center gap-2">
            <Copy class="w-3 h-3" /> Duplicate
        </button>
        <button @click="handleContextAction('toggleDraft')" class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-gold/10 hover:text-primary-900 flex items-center gap-2">
            <EyeOff class="w-3 h-3" /> Toggle Draft
        </button>
        <div class="h-px bg-slate-100 my-1"></div>
        <button @click="handleContextAction('delete')" class="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <Trash2 class="w-3 h-3" /> Delete
        </button>
    </div>

    <!-- Session Editor Modal (Reused/Updated) -->
    <div v-if="editingSession" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-primary-950/60 backdrop-blur-sm" @click="closeEditor"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <div>
                    <h3 class="text-xl font-black text-primary-900">
                        {{ editingSession.id.startsWith('new') ? 'New Session' : 'Edit Session' }}
                    </h3>
                    <p class="text-xs text-slate-500 uppercase tracking-widest">
                        {{ editingSession.name || 'Untitled' }}
                    </p>
                </div>
                <button type="button" class="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition" @click="closeEditor">
                    <X class="w-6 h-6" />
                </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-6">
                <!-- Metrics Inputs (Enterprise) -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-3 gap-4">
                     <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Proj. Revenue</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2 text-slate-400 text-xs">$</span>
                            <input v-model.number="editingSession.projectedRevenue" type="number" class="w-full pl-6 rounded-lg border-slate-200 text-xs font-bold text-emerald-600 focus:border-gold focus:ring-gold" placeholder="0" />
                        </div>
                     </div>
                     <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tickets Sold</label>
                        <input v-model.number="editingSession.ticketsSold" type="number" class="w-full rounded-lg border-slate-200 text-xs font-bold text-slate-700 focus:border-gold focus:ring-gold" placeholder="0" />
                     </div>
                     <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Seats</label>
                        <input v-model.number="editingSession.totalSeats" type="number" class="w-full rounded-lg border-slate-200 text-xs font-bold text-slate-700 focus:border-gold focus:ring-gold" placeholder="100" />
                     </div>
                </div>

                <!-- Basic Info -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Session Name</span>
                        <input v-model="editingSession.name" type="text" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold" />
                    </label>
                     <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Category</span>
                        <input v-model="editingSession.category" type="text" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold" list="categories" />
                        <datalist id="categories">
                            <option value="General"></option>
                            <option value="Special"></option>
                            <option value="Holiday"></option>
                        </datalist>
                    </label>
                </div>

                <!-- Timing -->
                <div class="grid grid-cols-2 gap-6">
                     <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Start Time</span>
                        <input v-model="editingSession.startTime" type="text" placeholder="e.g. 6:30 PM" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold" />
                    </label>
                    <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">End Time</span>
                        <input v-model="editingSession.endTime" type="text" placeholder="e.g. 9:00 PM" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold" />
                    </label>
                </div>

                <!-- Recurring / Override Logic Display -->
                <div v-if="editingSession.overrideDate" class="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start gap-2">
                    <AlertTriangle class="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                        <p class="text-xs font-bold text-amber-800">One-Off Override</p>
                        <p class="text-[10px] text-amber-700">This session is scheduled specifically for {{ editingSession.overrideDate }}. It is detached from the weekly recurrence.</p>
                    </div>
                </div>
                <div v-else-if="editingSession.availableDays && editingSession.availableDays.length > 0" class="bg-primary-50 border border-primary-100 p-3 rounded-lg">
                     <p class="text-xs font-bold text-primary-800 mb-2">Recurring Schedule</p>
                     <div class="flex flex-wrap gap-2">
                         <button
                            v-for="day in weekDays"
                            :key="day"
                            type="button"
                            :class="[
                                'px-3 py-1 rounded text-[10px] font-bold transition-all border',
                                editingSession.availableDays?.includes(day)
                                    ? 'bg-primary-900 text-white border-primary-900'
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                            ]"
                            @click="toggleDay(day)"
                         >
                            {{ day }}
                         </button>
                     </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Status</span>
                        <select v-model="editingSession.status" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold">
                            <option value="Upcoming">Upcoming</option>
                            <option value="Live">Live</option>
                            <option value="Closing">Closing</option>
                            <option value="Sold Out">Sold Out</option>
                        </select>
                    </label>
                    <div class="flex items-center pt-6">
                         <label class="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" v-model="editingSession.isDraft" class="rounded border-slate-300 text-gold focus:ring-gold" />
                             <span class="text-sm font-bold text-slate-700">Save as Draft</span>
                         </label>
                    </div>
                </div>
            </div>

            <div class="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 z-10 rounded-b-2xl">
                <BaseButton variant="outline" type="button" @click="closeEditor">Cancel</BaseButton>
                <BaseButton variant="gold" type="button" @click="saveSession">Done</BaseButton>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseCard from '~/components/ui/BaseCard.vue';
import BaseButton from '~/components/ui/BaseButton.vue';
import { Plus, Trash2, X, ChevronLeft, ChevronRight, Edit, Copy, EyeOff, AlertTriangle } from 'lucide-vue-next';
import { parseTime } from '~/utils/time.utils';

const props = defineProps<{
  modelValue: any[];
  isSaving: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

// --- State ---
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const currentDate = ref(new Date()); // Represents the 1st of the displayed month
const unsavedChanges = ref(false);
const editingSession = ref<any>(null);
const contextMenu = ref({ visible: false, x: 0, y: 0, session: null as any });
const filters = ref({
    showDrafts: true,
    highlightConflicts: true
});

// --- Computed Calendar Logic ---
const currentMonthName = computed(() => currentDate.value.toLocaleString('default', { month: 'long' }));
const currentYear = computed(() => currentDate.value.getFullYear());

const calendarCells = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();

    // First day of month
    const firstDayOfMonth = new Date(year, month, 1);
    // Day of week (0=Sun, 1=Mon...). We want Mon=0, Sun=6
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    // Last day of month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    const cells = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthLastDay - i);
        cells.push(createCell(d, false));
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
        const d = new Date(year, month, i);
        cells.push(createCell(d, true));
    }

    // Next month padding
    const remaining = 42 - cells.length; // 6 rows * 7 cols
    for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        cells.push(createCell(d, false));
    }

    return cells;
});

const createCell = (date: Date, isCurrentMonth: boolean) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...

    // Find sessions
    const sessions = getSessionsForDate(dateStr, dayName);

    // Check conflicts
    let hasConflict = false;
    if (sessions.length > 1) {
        // Simple conflict check: overlapping times
        // We'll need start/end minutes.
        // For efficiency, assume sessions sorted by startTime.
        for (let i = 0; i < sessions.length - 1; i++) {
            const s1 = sessions[i];
            const s2 = sessions[i+1];
            // Assuming start/end exist and parseable. If missing, skip.
            // Using parseTime helper
            const start1 = parseTime(s1.startTime || "");
            const end1 = parseTime(s1.endTime || "");
            const start2 = parseTime(s2.startTime || "");

            if (start2 < end1) {
                hasConflict = true;
                if (s1) s1.hasConflict = true;
                if (s2) s2.hasConflict = true;
            }
        }
    }

    return {
        date,
        dateStr,
        dayNum: date.getDate(),
        isCurrentMonth,
        isToday: new Date().toDateString() === date.toDateString(),
        sessions,
        hasConflict
    };
};

const getSessionsForDate = (dateStr: string, dayName: string) => {
    // 1. Find overrides for this specific date
    const overrides = props.modelValue.filter(s => s.overrideDate === dateStr);

    // 2. Find recurring sessions for this dayOfWeek
    const recurring = props.modelValue.filter(s => {
        if (s.overrideDate) return false; // Skip one-offs
        if (!s.availableDays?.includes(dayName)) return false; // Wrong day
        if (s.excludedDates?.includes(dateStr)) return false; // Excluded
        return true;
    });

    let combined = [...overrides, ...recurring];

    // Filter drafts
    if (!filters.value.showDrafts) {
        combined = combined.filter(s => !s.isDraft);
    }

    // Map to include display helpers
    return combined.map(s => ({
        ...s,
        uniqueKey: s.id + '-' + dateStr, // unique key for v-for
        occupancy: Math.round(((s.ticketsSold || 0) / (s.totalSeats || 100)) * 100) || 0,
        hasConflict: false // init
    })).sort((a, b) => {
         const ta = parseTime(a.startTime);
         const tb = parseTime(b.startTime);
         return ta - tb;
    });
};

// --- Actions ---

const changeMonth = (delta: number) => {
    const d = new Date(currentDate.value);
    d.setMonth(d.getMonth() + delta);
    currentDate.value = d;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Live': return 'bg-emerald-500';
        case 'Upcoming': return 'bg-sky-500';
        case 'Closing': return 'bg-amber-500';
        case 'Sold Out': return 'bg-rose-500';
        default: return 'bg-slate-300';
    }
};

const formatMoney = (val?: number) => val ? val.toLocaleString() : '0';

// --- Drag and Drop ---
const onDragStart = (e: DragEvent, session: any) => {
    if (e.dataTransfer) {
        e.dataTransfer.setData('application/json', JSON.stringify(session));
        e.dataTransfer.effectAllowed = 'move';
    }
};

const onDrop = (e: DragEvent, targetDateStr: string) => {
    const data = e.dataTransfer?.getData('application/json');
    if (!data) return;
    const session = JSON.parse(data);

    // Logic:
    // If we drag a session to a new date:
    // 1. If it's a one-off (has overrideDate): Just update overrideDate.
    // 2. If it's recurring:
    //    a. Add the source date (implied from where we dragged it?) -> Wait, we don't know the source date from the session object alone if it's recurring.
    //    BUT, we can infer it if we pass sourceDate in drag data.
    //    Let's simplify: "Smart" drag usually implies creating an exception.
    //    We should create a copy with overrideDate = targetDateStr, and Exclude the original date if possible.
    //    However, determining the "Original Date" accurately requires passing it.

    // For now, let's just "Copy" the session configuration to the new date as a one-off override.
    // This supports the "Clone" use case.
    // To support "Move", we need to know where it came from to exclude it.

    // Let's implement "Move" by checking if we can find the source date in the uniqueKey (hacky but works locally).
    // uniqueKey format: ID-YYYY-MM-DD

    const parts = (session.uniqueKey || '').split('-');
    // The ID might contain dashes, so we take the last 3 parts as date? No, date is YYYY-MM-DD (3 parts).
    // Let's assume date is at the end.
    const sourceDateStr = parts.slice(-3).join('-');

    if (sourceDateStr === targetDateStr) return; // Same day drop

    // Update Data
    const updatedList = [...props.modelValue];

    if (session.overrideDate) {
        // It was already a one-off, just move it
        const idx = updatedList.findIndex(s => s.id === session.id);
        if (idx !== -1) {
            updatedList[idx] = { ...updatedList[idx], overrideDate: targetDateStr };
        }
    } else {
        // It was recurring.
        // 1. Exclude from source
        const recurringIdx = updatedList.findIndex(s => s.id === session.id);
        if (recurringIdx !== -1) {
            const recurring = { ...updatedList[recurringIdx] };
            recurring.excludedDates = [...(recurring.excludedDates || []), sourceDateStr];
            updatedList[recurringIdx] = recurring;
        }

        // 2. Create override at target
        const newOverride = {
            ...session,
            id: `override-${Date.now()}`,
            overrideDate: targetDateStr,
            availableDays: [], // clear recurrence
            excludedDates: [],
            uniqueKey: undefined,
            hasConflict: false
        };
        updatedList.push(newOverride);
    }

    emit('update:modelValue', updatedList);
    unsavedChanges.value = true;
};

const toggleFilter = (key: 'drafts' | 'conflicts') => {
    if (key === 'drafts') filters.value.showDrafts = !filters.value.showDrafts;
    if (key === 'conflicts') filters.value.highlightConflicts = !filters.value.highlightConflicts;
};

// --- Context Menu ---
const openContextMenu = (e: MouseEvent, session: any) => {
    contextMenu.value = {
        visible: true,
        x: e.clientX,
        y: e.clientY,
        session
    };
    // Close on click elsewhere handled by a global listener or overlay usually,
    // but here `mouseleave` on the menu helps or a click listener on window.
};

const closeContextMenu = () => {
    contextMenu.value.visible = false;
};

const handleContextAction = (action: string) => {
    if (!contextMenu.value.session) return;
    const s = contextMenu.value.session;

    if (action === 'edit') editSession(s);
    if (action === 'delete') deleteSession(s); // Needs adaptation to handle recurring instance deletion
    if (action === 'duplicate') duplicateSession(s);
    if (action === 'toggleDraft') toggleDraft(s);

    closeContextMenu();
};

const toggleDraft = (session: any) => {
    const updatedList = [...props.modelValue];
    // If recurring, we might need to be careful. For now, toggle the definition.
    const idx = updatedList.findIndex(x => x.id === session.id);
    if (idx !== -1) {
        updatedList[idx] = { ...updatedList[idx], isDraft: !updatedList[idx].isDraft };
        emit('update:modelValue', updatedList);
        unsavedChanges.value = true;
    }
};

const duplicateSession = (session: any) => {
    const clone = JSON.parse(JSON.stringify(session));
    clone.id = `copy-${Date.now()}`;
    clone.name += ' (Copy)';
    delete clone.uniqueKey;
    delete clone.hasConflict;

    const updatedList = [...props.modelValue, clone];
    emit('update:modelValue', updatedList);
    unsavedChanges.value = true;
};

// --- Editor Logic ---
const createSessionId = () => `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const addNewSession = (dateStr: string) => {
    editingSession.value = {
        id: createSessionId(),
        name: "New Session",
        category: "General",
        startTime: "6:00 PM",
        endTime: "9:00 PM",
        gameType: "Regular",
        status: "Upcoming",
        overrideDate: dateStr, // Default to clicked date as one-off
        availableDays: [],
        pricing: {},
        specials: {},
        isDraft: true, // Default to draft for safety
        projectedRevenue: 0,
        ticketsSold: 0,
        totalSeats: 100
    };
};

const editSession = (session: any) => {
    // We edit the underlying definition.
    // If the user clicked a recurring instance, they are editing the *Pattern*.
    // We should visually indicate this or offer to "Detach".
    // For this MVP, we edit the pattern or the override object directly.
    const realSession = props.modelValue.find(s => s.id === session.id);
    if (realSession) {
        editingSession.value = JSON.parse(JSON.stringify(realSession));
    }
};

const saveSession = () => {
    if (!editingSession.value) return;

    const index = props.modelValue.findIndex(s => s.id === editingSession.value.id);
    const updatedList = [...props.modelValue];

    if (index >= 0) {
        updatedList[index] = editingSession.value;
    } else {
        updatedList.push(editingSession.value);
    }

    emit('update:modelValue', updatedList);
    unsavedChanges.value = true;
    closeEditor();
};

const deleteSession = (session?: any) => {
    const target = session || editingSession.value;
    if (!target) return;

    if (!confirm('Are you sure? If this is a recurring session, it will delete ALL instances.')) return;

    const updatedList = props.modelValue.filter(s => s.id !== target.id);
    emit('update:modelValue', updatedList);
    unsavedChanges.value = true;
    closeEditor();
};

const closeEditor = () => {
    editingSession.value = null;
};

const toggleDay = (day: string) => {
    if (!editingSession.value) return;
    if (!editingSession.value.availableDays) editingSession.value.availableDays = [];

    // If adding a day, we should probably clear overrideDate to make it a proper recurring pattern?
    // Or allow hybrid? Typically hybrid is confusing.
    // Let's assume if you add days, you want it recurring.
    if (editingSession.value.overrideDate) {
        if (!confirm("Converting this one-off session to a recurring schedule will clear the specific date. Continue?")) return;
        editingSession.value.overrideDate = undefined;
    }

    const days = editingSession.value.availableDays;
    if (days.includes(day)) {
        editingSession.value.availableDays = days.filter((d: string) => d !== day);
    } else {
        days.push(day);
    }
};

const saveAll = () => {
    emit('save');
    unsavedChanges.value = false;
};

</script>
