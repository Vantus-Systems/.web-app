<template>
  <div class="p-4 bg-white rounded-lg shadow-xl border border-slate-200 w-[500px]">
    <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
      <div>
        <h3 class="font-black text-slate-900 text-lg">{{ formattedDate }}</h3>
        <div class="text-xs text-slate-500 font-medium uppercase tracking-wider">
          {{ profileName || 'No Profile Assigned' }}
        </div>
      </div>
      <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Timeline Viz -->
    <div class="relative h-24 bg-slate-50 rounded-md border border-slate-200 overflow-hidden mb-4">
      <!-- Hours Markers -->
      <div class="absolute top-0 bottom-0 w-full flex justify-between px-2 text-[9px] text-slate-300 select-none pointer-events-none">
        <span v-for="h in 24" :key="h" class="border-l border-slate-100 h-full pl-0.5 pt-1">{{ h }}</span>
      </div>

      <!-- Main Flow Bar -->
      <div v-if="profile" class="absolute top-8 left-0 right-0 h-8 mx-4">
         <div 
           class="h-full rounded bg-gradient-to-r from-primary-400 to-primary-600 shadow-sm relative group"
           :style="{ left: '20%', right: '20%' }" 
         >
            <!-- Tooltip -->
           <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
             Standard Operations Flow
           </div>
         </div>
      </div>
      
      <!-- Trigger Points (Mock) -->
      <div v-if="profile" class="absolute top-6 left-1/4 w-0.5 h-12 bg-rose-400 z-10">
        <div class="absolute -top-1 -left-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" title="Door Open" />
      </div>
      <div v-if="profile" class="absolute top-6 right-1/4 w-0.5 h-12 bg-amber-400 z-10">
        <div class="absolute -top-1 -left-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" title="Last Call" />
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="p-2 bg-slate-50 rounded border border-slate-100">
        <div class="text-[10px] text-slate-400 uppercase font-bold">Revenue</div>
        <div class="font-mono font-bold text-slate-700">$12,450</div>
      </div>
      <div class="p-2 bg-slate-50 rounded border border-slate-100">
        <div class="text-[10px] text-slate-400 uppercase font-bold">Labor</div>
        <div class="font-mono font-bold text-slate-700">14.2%</div>
      </div>
      <div class="p-2 bg-slate-50 rounded border border-slate-100">
        <div class="text-[10px] text-slate-400 uppercase font-bold">Staff</div>
        <div class="font-mono font-bold text-slate-700">8 Active</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  date: string;
  profile?: any;
}>();

defineEmits(["close"]);

const formattedDate = computed(() => {
  return new Date(props.date).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
});

const profileName = computed(() => props.profile?.name);
</script>
