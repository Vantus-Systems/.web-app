<template>
  <div class="h-full flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
      <div>
        <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold">
          Master Schedule
        </p>
        <h3 class="text-xl font-black text-primary-900">
          {{ monthLabel }}
        </h3>
      </div>
      <div class="flex gap-2">
        <button class="text-xs font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg" @click="$emit('prev')">
          Prev
        </button>
        <button class="text-xs font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg" @click="$emit('next')">
          Next
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-px bg-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
      <div v-for="day in weekDays" :key="day" class="bg-white px-2 py-2 text-center">
        {{ day }}
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <div class="grid grid-cols-7 gap-px bg-slate-200 h-full">
        <div
          v-for="cell in days"
          :key="cell.date"
          class="bg-white p-2 min-h-[110px] flex flex-col justify-between border border-transparent"
          :class="{
            'bg-slate-50 text-slate-400': !cell.isCurrentMonth,
            'border-primary-500 ring-2 ring-primary-100': selectedDates.includes(cell.date),
          }"
          @click="selectDate(cell.date, $event)"
          @dragover.prevent
          @drop="handleDrop(cell.date, $event)"
        >
          <div class="text-xs font-bold text-slate-500">{{ cell.day }}</div>
          <div class="mt-2 flex-1 flex flex-col items-start justify-center">
            <div
              v-if="cell.assignment?.status === 'open' && cell.profile"
              class="px-2 py-1 rounded-full text-[10px] font-bold text-white"
              :style="{ backgroundColor: cell.profile.color || '#64748b' }"
            >
              {{ cell.profile.name }}
            </div>
            <div
              v-else-if="cell.assignment?.status === 'closed' && !cell.isFallback"
              class="px-2 py-1 rounded-full text-[10px] font-bold text-rose-600 border border-rose-200"
            >
              Closed
            </div>
            <div
              v-else
              class="px-2 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-dashed border-slate-300"
            >
              Drop Profile
            </div>
          </div>
          <div
            v-if="!cell.assignment || cell.isFallback"
            class="h-2 w-full bg-amber-200/60 rounded-full mt-2"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OpsSchemaCalendarAssignment, OpsSchemaDayProfile } from "~/types/ops-schema";

type CalendarCell = {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  assignment?: OpsSchemaCalendarAssignment;
  profile?: OpsSchemaDayProfile;
  isFallback?: boolean;
};

const props = defineProps<{
  monthLabel: string;
  days: CalendarCell[];
  weekDays: string[];
  selectedDates: string[];
}>();

const emit = defineEmits<{
  (e: "select", payload: { date: string; multi: boolean }): void;
  (e: "assign", payload: { date: string; profileId: string }): void;
  (e: "prev"): void;
  (e: "next"): void;
}>();

const selectDate = (date: string, event: MouseEvent) => {
  emit("select", { date, multi: event.metaKey || event.ctrlKey || event.shiftKey });
};

const handleDrop = (date: string, event: DragEvent) => {
  const data = event.dataTransfer?.getData("application/x-ops-profile");
  if (!data) return;
  const payload = JSON.parse(data);
  emit("assign", { date, profileId: payload.id });
};
</script>
