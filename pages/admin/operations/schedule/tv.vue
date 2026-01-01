<template>
  <div class="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
    <div class="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tight text-white">
           Mary Esther Bingo <span class="text-amber-400">Schedule</span>
        </h1>
        <p class="text-slate-400 font-bold uppercase tracking-widest mt-1">Upcoming Sessions</p>
      </div>
      <div class="text-right">
        <div class="text-4xl font-mono font-bold text-emerald-400">{{ time }}</div>
        <div class="text-sm font-bold text-slate-500 uppercase">{{ date }}</div>
      </div>
    </div>

    <div class="flex-1 p-6 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center h-full">
         <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
      <div v-else-if="schedule.length === 0" class="flex items-center justify-center h-full text-slate-500 font-bold uppercase tracking-widest">
         No upcoming sessions scheduled.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto">
         <div
           v-for="day in schedule"
           :key="day.date"
           class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col"
         >
            <div class="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
               <span class="text-xl font-black uppercase">{{ day.dayOfWeek }}</span>
               <span class="text-sm font-bold text-slate-400">{{ day.dateDisplay }}</span>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-center items-center text-center space-y-2">
               <div v-if="day.isHoliday" class="text-amber-500 font-black uppercase tracking-widest text-lg">
                  {{ day.holidayName || 'Holiday' }}
               </div>
               <div v-else-if="day.profile">
                  <div class="text-2xl font-bold text-white mb-2">{{ day.profile.name }}</div>
                  <div class="px-3 py-1 bg-slate-700 rounded text-slate-300 font-mono text-lg">
                     {{ day.profile.time || 'Standard Hours' }}
                  </div>
               </div>
               <div v-else class="text-slate-600 font-bold uppercase tracking-widest">
                  Closed
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useOpsStore } from '~/stores/ops';

definePageMeta({
  layout: 'blank'
});

const opsStore = useOpsStore();
const loading = ref(true);
const schedule = ref<any[]>([]);

const time = ref('');
const date = ref('');
let timer: any;

const updateClock = () => {
    const now = new Date();
    time.value = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    date.value = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

onMounted(async () => {
    updateClock();
    timer = setInterval(updateClock, 1000);

    // Load data
    await opsStore.loadAll();

    // Process schedule for next 7 days
    const today = new Date();
    const days = [];
    const assignments = opsStore.opsSchemaLive?.calendar?.assignments || {}; // Use LIVE schema for TV
    const profiles = opsStore.opsSchemaLive?.dayProfiles || [];

    for(let i=0; i<7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().slice(0, 10);

        const assignment = assignments[iso];
        let profile = null;
        if(assignment && assignment.profile_id) {
            const p = profiles.find((x: any) => x.id === assignment.profile_id);
            if(p) {
                profile = {
                   name: p.name,
                   time: p.description // or construct from segments
                };
            }
        }

        days.push({
            date: iso,
            dateDisplay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'long' }),
            profile,
            isHoliday: false // Todo: fetch holidays
        });
    }

    schedule.value = days;
    loading.value = false;
});

onUnmounted(() => clearInterval(timer));
</script>
