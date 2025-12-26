<template>
  <div class="space-y-8">
    <BaseCard class-name="space-y-6">
      <template #header>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-gold font-bold text-xs uppercase tracking-[0.4em] mb-1">
              Timeline Command Center
            </p>
            <h3 class="text-3xl font-black text-primary-950">
              Schedule Control Room
            </h3>
            <p class="text-sm text-slate-500">
              Manage sessions with a monthly calendar view.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
             <div class="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                 <button @click="changeMonth(-1)" class="p-2 hover:bg-white rounded-md transition text-slate-500 hover:text-primary-900">
                     <ChevronLeft class="w-4 h-4" />
                 </button>
                 <span class="text-sm font-bold text-primary-900 w-32 text-center">{{ currentMonthLabel }}</span>
                 <button @click="changeMonth(1)" class="p-2 hover:bg-white rounded-md transition text-slate-500 hover:text-primary-900">
                     <ChevronRight class="w-4 h-4" />
                 </button>
             </div>
             <BaseButton
              variant="gold"
              class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
              type="button"
              :disabled="isSaving"
              @click="$emit('save')"
            >
              <span v-if="isSaving">Publishing...</span>
              <span v-else>Publish Schedule</span>
            </BaseButton>
          </div>
        </div>
      </template>

      <!-- Monthly Calendar View -->
      <div class="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  {{ day }}
              </div>
          </div>
          <div class="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
               <div
                  v-for="(day, index) in calendarDays"
                  :key="`${day.dateStr}-${index}`"
                  class="min-h-[140px] bg-white p-2 relative group hover:bg-slate-50 transition-colors"
                  :class="{ 'opacity-50 bg-slate-50': !day.isCurrentMonth }"
               >
                   <div class="flex justify-between items-start mb-2">
                       <span
                          class="text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full"
                          :class="isToday(day.dateStr || '') ? 'bg-gold text-primary-900' : 'text-slate-700'"
                       >
                           {{ day.dayNum }}
                       </span>
                       <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button
                              class="p-1 text-slate-400 hover:text-gold transition-all"
                              title="Copy Schedule to Entire Month"
                              @click.stop="copyDayToMonth(day)"
                           >
                               <Copy class="w-4 h-4" />
                           </button>
                           <button
                              class="p-1 text-slate-400 hover:text-gold transition-all"
                              title="Add Session Override"
                              @click.stop="openDayEditor(day)"
                           >
                               <Plus class="w-4 h-4" />
                           </button>
                       </div>
                   </div>

                   <!-- Sessions for this specific date -->
                   <div class="space-y-1">
                       <div
                          v-for="session in getSessionsForDate(day.dateStr || '')"
                          :key="session.id"
                          class="text-[10px] p-1.5 rounded border truncate cursor-pointer transition-all"
                          :class="[
                              session.isOverride ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-600',
                              'hover:border-gold hover:shadow-sm'
                          ]"
                          @click.stop="editSession(session, day.dateStr || '')"
                       >
                           <span class="font-bold">{{ session.startTime }}</span> {{ session.name }}
                       </div>
                   </div>
               </div>
          </div>
      </div>
    </BaseCard>

    <!-- Session Editor Modal -->
    <div v-if="editingSession" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-primary-950/50 backdrop-blur-sm" @click="closeEditor"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">

            <div class="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <div>
                    <h3 class="text-xl font-black text-primary-900">
                        {{ editingSession.id.startsWith('temp-') ? 'New Session' : 'Edit Session' }}
                    </h3>
                    <p class="text-xs text-slate-500 uppercase tracking-widest">
                        {{ editingSession.name || 'Untitled' }}
                        <span v-if="editingTargetDate" class="ml-2 text-gold-600 font-bold">
                            @ {{ formatDate(editingTargetDate) }}
                        </span>
                        <span v-else class="ml-2 text-slate-400 font-bold">
                            (Recurring Pattern)
                        </span>
                    </p>
                </div>
                <div class="flex gap-2">
                    <button
                        v-if="!editingSession.id.startsWith('temp-')"
                        type="button"
                        class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Session"
                        @click="deleteSession"
                    >
                        <Trash2 class="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        class="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition"
                        @click="closeEditor"
                    >
                        <X class="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div class="p-6 space-y-6">
                <!-- Override Warning -->
                <div v-if="editingTargetDate && !editingSession.isOverride" class="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 class="text-sm font-bold text-amber-900">Editing Recurring Session for a Specific Date</h4>
                        <p class="text-xs text-amber-700 mt-1">
                            Saving changes here will create a specific override for <strong>{{ formatDate(editingTargetDate) }}</strong>.
                            It will not affect this session on other days.
                        </p>
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

                <!-- Status & Type -->
                <div class="grid grid-cols-2 gap-6">
                     <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Game Type</span>
                        <input v-model="editingSession.gameType" type="text" placeholder="e.g. Regular" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold" />
                    </label>
                    <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Status</span>
                        <select v-model="editingSession.status" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold">
                            <option value="Upcoming">Upcoming</option>
                            <option value="Live">Live</option>
                            <option value="Closing">Closing</option>
                            <option value="Sold Out">Sold Out</option>
                        </select>
                    </label>
                </div>

                <!-- Days Selection (Only if NOT overriding a specific date) -->
                <div v-if="!editingTargetDate">
                     <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Recurring Days</span>
                     <div class="flex flex-wrap gap-2">
                         <button
                            v-for="day in daysOfWeek"
                            :key="day"
                            type="button"
                            :class="[
                                'px-4 py-2 rounded-lg text-sm font-bold transition-all border',
                                editingSession.availableDays?.includes(day)
                                    ? 'bg-primary-900 text-white border-primary-900 shadow-lg'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            ]"
                            @click="toggleDay(day)"
                         >
                            {{ day }}
                         </button>
                     </div>
                     <p class="text-xs text-slate-400 mt-2">
                        Select which days of the week this session normally occurs.
                     </p>
                </div>

                <!-- Daily Special Promotion (Only visible if specific day or overriding) -->
                 <div v-if="editingTargetDate || editingSession.availableDays?.length > 0">
                    <label class="block">
                        <span class="text-xs font-bold text-gold-600 uppercase tracking-wider mb-1 block flex items-center gap-1">
                            <Star class="w-3 h-3" /> Daily Promotion / Special
                        </span>
                        <input
                            v-if="editingTargetDate"
                            v-model="editingSession.specials[editingTargetDate]"
                            type="text"
                            placeholder="e.g. Free Dauber with Buy-In"
                            class="w-full rounded-xl border-gold-200 bg-gold-50/50 focus:border-gold focus:ring-gold"
                        />
                         <p v-else class="text-xs text-slate-400 italic">
                             Promotions are set on specific calendar dates.
                         </p>
                    </label>
                 </div>

                 <!-- Details -->
                 <label class="block">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</span>
                    <textarea v-model="editingSession.description" rows="3" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"></textarea>
                </label>

                <div class="grid grid-cols-2 gap-6">
                     <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Jackpot</span>
                        <input v-model="editingSession.jackpot" type="text" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold" />
                    </label>
                    <label class="block">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Eligibility</span>
                        <input v-model="editingSession.eligibility" type="text" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold" />
                    </label>
                </div>
            </div>

            <div class="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 z-10 rounded-b-2xl">
                <BaseButton variant="outline" type="button" @click="closeEditor">Cancel</BaseButton>
                <BaseButton variant="gold" type="button" @click="saveSession">
                    {{ editingTargetDate ? 'Save Override' : 'Save Session' }}
                </BaseButton>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseCard from '~/components/ui/BaseCard.vue';
import BaseButton from '~/components/ui/BaseButton.vue';
import { Plus, Trash2, X, ChevronLeft, ChevronRight, AlertTriangle, Star, Copy } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: any[];
  isSaving: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const currentDate = ref(new Date());
const editingSession = ref<any>(null);
const editingTargetDate = ref<string | null>(null);

// Calendar Navigation
const currentMonthLabel = computed(() => {
    return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() + delta);
    currentDate.value = newDate;
};

// Generate Calendar Grid
const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days = [];

    // Previous Month Padding
    const startPadding = firstDayOfMonth.getDay(); // 0 is Sunday
    for (let i = startPadding; i > 0; i--) {
        const d = new Date(year, month, 1 - i);
        days.push({
            date: d,
            dateStr: d.toISOString().split('T')[0],
            dayNum: d.getDate(),
            isCurrentMonth: false
        });
    }

    // Current Month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const d = new Date(year, month, i);
        days.push({
            date: d,
            dateStr: d.toISOString().split('T')[0],
            dayNum: i,
            isCurrentMonth: true
        });
    }

    // Next Month Padding (to fill 6 rows of 7 = 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        const d = new Date(year, month + 1, i);
        days.push({
            date: d,
            dateStr: d.toISOString().split('T')[0],
            dayNum: i,
            isCurrentMonth: false
        });
    }

    return days;
});

const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
};

const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// --- Session Logic ---

// Get sessions for a specific date (combining recurring + overrides)
const getSessionsForDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00'); // Midday to avoid timezone issues
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }); // "Mon", "Tue"...

    // 1. Find Recurring Sessions that match this day of week
    const recurring = props.modelValue.filter(s =>
        !s.isOverride &&
        s.availableDays?.includes(dayOfWeek)
    );

    // 2. Find Overrides for this specific date
    const overrides = props.modelValue.filter(s => s.overrideDate === dateStr);

    const effectiveSessions = [];

    // Add valid recurring sessions
    for (const session of recurring) {
        if (!session.excludedDates?.includes(dateStr)) {
             effectiveSessions.push({ ...session, isOverride: false });
        }
    }

    // Add overrides
    for (const session of overrides) {
        effectiveSessions.push({ ...session, isOverride: true });
    }

    return effectiveSessions.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
};

const openDayEditor = (day: any) => {
    // Open a blank session for this specific day
    editingTargetDate.value = day.dateStr;
    editingSession.value = {
        id: `temp-${Date.now()}`,
        name: "New Event",
        category: "General",
        startTime: "6:00 PM",
        endTime: "9:00 PM",
        gameType: "Special",
        description: "",
        status: "Upcoming",
        jackpot: "",
        eligibility: "18+",
        availableDays: [], // Irrelevant for override
        overrideDate: day.dateStr,
        isOverride: true,
        vibe: ["Fun"],
        specials: {},
    };
};

const editSession = (session: any, dateStr: string) => {
    editingTargetDate.value = dateStr;

    // Deep clone
    const clone = JSON.parse(JSON.stringify(session));
    if (!clone.specials) clone.specials = {};

    if (session.isOverride) {
        // We are editing an existing override
        editingSession.value = clone;
    } else {
        // We are clicking a Recurring session on a specific date.
        // Editing it should propose creating an Override.
        clone.id = `temp-override-${Date.now()}`; // New ID for the override
        clone.parentId = session.id; // Link to original
        clone.overrideDate = dateStr;
        clone.isOverride = true;
        // Keep availableDays for reference or clear them? Clear them to avoid confusion.
        clone.availableDays = [];
        editingSession.value = clone;
    }
};

const closeEditor = () => {
    editingSession.value = null;
    editingTargetDate.value = null;
};

const toggleDay = (day: string) => {
    if (!editingSession.value) return;
    if (!editingSession.value.availableDays) editingSession.value.availableDays = [];
    const days = editingSession.value.availableDays;
    if (days.includes(day)) {
        editingSession.value.availableDays = days.filter((d: string) => d !== day);
    } else {
        days.push(day);
    }
};

const saveSession = () => {
    if (!editingSession.value) return;

    let updatedList = [...props.modelValue];
    const sessionToSave = { ...editingSession.value };

    // If saving an override
    if (sessionToSave.isOverride && sessionToSave.overrideDate) {
        // 1. If it has a parent (it was a recurring session we are now customizing),
        // we must exclude the date from the parent to avoid duplication.
        if (sessionToSave.parentId) {
            const parentIndex = updatedList.findIndex(s => s.id === sessionToSave.parentId);
            if (parentIndex >= 0) {
                const parent = updatedList[parentIndex];
                if (!parent.excludedDates) parent.excludedDates = [];
                if (!parent.excludedDates.includes(sessionToSave.overrideDate)) {
                    parent.excludedDates.push(sessionToSave.overrideDate);
                    updatedList[parentIndex] = parent; // Update parent
                }
            }
            delete sessionToSave.parentId; // Clean up
        }

        // 2. Add/Update the override session
        if (sessionToSave.id.startsWith('temp-')) {
             sessionToSave.id = `evt-${Date.now()}-${Math.floor(Math.random()*1000)}`;
             updatedList.push(sessionToSave);
        } else {
             const idx = updatedList.findIndex(s => s.id === sessionToSave.id);
             if (idx >= 0) updatedList[idx] = sessionToSave;
             else updatedList.push(sessionToSave);
        }

    } else {
        // Saving a normal Recurring session (logic from before)
        // If it was a temp ID, give it a real one
        if (sessionToSave.id.startsWith('temp-') || sessionToSave.id.startsWith('session-') && !props.modelValue.find(s=>s.id === sessionToSave.id)) {
             // It's new
             // Ensure ID is unique if we generated it in `createSessionId` earlier
             if (sessionToSave.id.startsWith('temp-')) sessionToSave.id = `session-${Date.now()}`;
             updatedList.push(sessionToSave);
        } else {
             const idx = updatedList.findIndex(s => s.id === sessionToSave.id);
             if (idx >= 0) updatedList[idx] = sessionToSave;
        }
    }

    emit('update:modelValue', updatedList);
    closeEditor();
};

const deleteSession = () => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    // If deleting an override
    if (editingSession.value.isOverride) {
        const updatedList = props.modelValue.filter(s => s.id !== editingSession.value.id);
        emit('update:modelValue', updatedList);
    } else {
        // Deleting a recurring session template
        const updatedList = props.modelValue.filter(s => s.id !== editingSession.value.id);
        emit('update:modelValue', updatedList);
    }

    closeEditor();
};

// --- COPY DAY TO MONTH LOGIC ---

const copyDayToMonth = (sourceDay: any) => {
  if (!confirm(`Overwrite the entire month of ${currentMonthLabel.value} with the schedule from ${formatDate(sourceDay.dateStr)}? This will create individual entries for every day and cannot be easily undone.`)) return;

  const sourceDateStr = sourceDay.dateStr;
  const sourceSessions = getSessionsForDate(sourceDateStr);

  // We need to mutate the modelValue
  let updatedList = [...props.modelValue];

  // Identify target dates (all days in current month except source)
  const targetDates = calendarDays.value
    .filter(d => d.isCurrentMonth && d.dateStr !== sourceDateStr)
    .map(d => d.dateStr);

  // 1. Clear existing OVERRIDES for target dates to ensure a clean slate
  updatedList = updatedList.filter(s => !s.overrideDate || !targetDates.includes(s.overrideDate));

  // 2. For every target date, create overrides based on source sessions
  targetDates.forEach(targetDate => {
      sourceSessions.forEach(session => {
          const newSession = JSON.parse(JSON.stringify(session));
          // Create unique ID
          newSession.id = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          newSession.isOverride = true;
          newSession.overrideDate = targetDate;
          newSession.availableDays = []; // Clear recurrence rules
          delete newSession.parentId; // Detach from parent logic to keep it simple

          updatedList.push(newSession);
      });
  });

  emit('update:modelValue', updatedList);
};

</script>
