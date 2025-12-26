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
              Manage weekly sessions with a high-level calendar view.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
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

      <!-- Weekly Calendar View -->
      <div class="overflow-x-auto pb-4">
        <div class="min-w-[1000px] grid grid-cols-7 gap-4">
          <div v-for="day in daysOfWeek" :key="day" class="flex flex-col gap-4">
            <div class="text-center pb-2 border-b-2 border-primary-100">
              <h4 class="text-sm font-black text-primary-900 uppercase tracking-widest">{{ day }}</h4>
            </div>

            <div class="space-y-3 min-h-[200px] bg-slate-50/50 rounded-xl p-2 border border-dashed border-slate-200">
               <!-- Sessions for this day -->
               <div
                  v-for="session in getSessionsForDay(day)"
                  :key="session.id"
                  class="group relative bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-all hover:border-gold/50"
                  @click="editSession(session)"
               >
                  <div class="flex justify-between items-start mb-1">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ session.startTime }}</span>
                      <span class="text-[10px] font-bold text-slate-400" v-if="session.category">{{ session.category }}</span>
                  </div>
                  <h5 class="font-bold text-primary-900 text-sm leading-tight mb-2">{{ session.name }}</h5>
                  <div class="flex flex-wrap gap-1">
                      <span class="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{{ session.gameType }}</span>
                      <span v-if="session.status" :class="statusBadgeClass(session.status, true)">{{ session.status }}</span>
                  </div>
               </div>

               <!-- Add Button -->
               <button
                  @click="addNewSession(day)"
                  class="w-full py-3 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider hover:border-gold hover:text-gold hover:bg-gold/5 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus class="w-3 h-3" /> Add
               </button>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Session Editor Modal/Panel -->
    <div v-if="editingSession" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-primary-950/50 backdrop-blur-sm" @click="closeEditor"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">

            <div class="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <div>
                    <h3 class="text-xl font-black text-primary-900">
                        {{ editingSession.id ? 'Edit Session' : 'New Session' }}
                    </h3>
                    <p class="text-xs text-slate-500 uppercase tracking-widest">
                        {{ editingSession.name || 'Untitled' }}
                    </p>
                </div>
                <div class="flex gap-2">
                    <button
                        v-if="editingSession.id"
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

                <!-- Days Selection -->
                <div>
                     <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Active Days</span>
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
                        Select which days this specific session configuration applies to.
                     </p>
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

                <!-- Vibe -->
                 <div>
                     <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Vibe Tags</span>
                     <div class="flex flex-wrap gap-2">
                        <span v-for="(tag, idx) in editingSession.vibe ?? []" :key="idx" class="flex items-center bg-slate-100 rounded-full px-3 py-1 text-xs border border-slate-200">
                             <input v-model="editingSession.vibe[idx]" class="bg-transparent border-none p-0 w-20 text-xs font-semibold focus:ring-0" />
                             <button @click="editingSession.vibe.splice(idx, 1)" class="ml-1 text-slate-400 hover:text-rose-500">&times;</button>
                        </span>
                        <button @click="addVibe" class="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-transparent hover:border-primary-200">+ Add</button>
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
import { Plus, Trash2, X } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: any[];
  isSaving: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const editingSession = ref<any>(null);

// Get sessions that occur on a specific day
const getSessionsForDay = (day: string) => {
    return props.modelValue.filter(s => s.availableDays?.includes(day))
        .sort((a, b) => {
            // Simple sort by time if possible, otherwise by creation
            return (a.startTime || '').localeCompare(b.startTime || '');
        });
};

const statusBadgeClass = (status: string, small = false) => {
    const map: Record<string, string> = {
        Upcoming: "bg-yellow-100 text-yellow-800",
        Live: "bg-emerald-100 text-emerald-800",
        Closing: "bg-rose-100 text-rose-800",
        "Sold Out": "bg-slate-200 text-slate-600",
    };
    const classes = map[status] || "bg-slate-100 text-slate-500";
    return small ? `text-[9px] px-1.5 py-0.5 rounded ${classes}` : classes;
};

const createSessionId = () => `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const addNewSession = (day: string) => {
    editingSession.value = {
        id: createSessionId(), // Temporary ID until saved
        name: "New Session",
        category: "General",
        startTime: "6:00 PM",
        endTime: "9:00 PM",
        gameType: "Regular",
        description: "",
        status: "Upcoming",
        jackpot: "",
        eligibility: "18+",
        availableDays: [day], // Pre-select the column day
        vibe: ["Fun"],
        pricing: {},
    };
};

const editSession = (session: any) => {
    // Deep clone to avoid mutating the prop directly until "Done"
    editingSession.value = JSON.parse(JSON.stringify(session));
};

const closeEditor = () => {
    editingSession.value = null;
};

const toggleDay = (day: string) => {
    if (!editingSession.value) return;
    const days = editingSession.value.availableDays || [];
    if (days.includes(day)) {
        editingSession.value.availableDays = days.filter((d: string) => d !== day);
    } else {
        editingSession.value.availableDays.push(day);
    }
};

const addVibe = () => {
    if (!editingSession.value.vibe) editingSession.value.vibe = [];
    editingSession.value.vibe.push("");
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
    closeEditor();
};

const deleteSession = () => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    const updatedList = props.modelValue.filter(s => s.id !== editingSession.value.id);
    emit('update:modelValue', updatedList);
    closeEditor();
};

</script>
