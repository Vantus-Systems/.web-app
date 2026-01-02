<template>
  <div class="h-screen w-screen bg-base overflow-hidden flex flex-col">
    <div
      class="bg-surface border-b border-divider px-4 py-2 flex justify-between items-center shadow-sm z-30"
    >
      <div class="flex items-center gap-2">
        <h1 class="font-black text-primary text-xl tracking-tight">
          MISSION CONTROL
        </h1>
        <span
          class="px-2 py-0.5 rounded bg-accent-primary text-white text-xs font-bold uppercase"
          >LIVE</span
        >
      </div>
      <div class="text-sm font-mono text-secondary">
        {{ currentTime }}
      </div>
    </div>

    <div class="flex-1 relative overflow-hidden">
      <ScheduleCanvas
        v-if="opsStore.opsSchemaDraft"
        :range="activeDateRange"
        :weekday-defaults="opsStore.opsSchemaDraft.calendar.weekdayDefaults"
        :assignments="opsStore.opsSchemaDraft.calendar.assignments"
        :overrides="opsStore.opsSchemaDraft.calendar.overrides || {}"
        :profiles="dayProfiles"
        :holidays="holidays"
        :shifts="shifts"
        :selected-dates="[]"
        :active-tool-profile-id="null"
        view-mode="standard"
      />
      <div v-else class="flex items-center justify-center h-full">
        <div
          class="animate-pulse text-tertiary font-bold tracking-widest uppercase"
        >
          Initializing...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useNow, useDateFormat } from "@vueuse/core";
import { useOpsStore } from "~/stores/ops";
import ScheduleCanvas from "~/components/admin/schedule/ScheduleCanvas.vue";

const opsStore = useOpsStore();
const holidays = ref<any[]>([]);
const shifts = ref<any[]>([]);
const currentTime = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");

const activeDateRange = computed(() => {
  return (
    opsStore.opsSchemaDraft?.calendar.range || {
      start: new Date().getFullYear() + "-01-01",
      end: new Date().getFullYear() + "-12-31",
    }
  );
});

const dayProfiles = computed(() => opsStore.opsSchemaDraft?.dayProfiles ?? []);

let pollInterval: any;

onMounted(async () => {
  await loadData();
  // Poll for updates every 60s
  pollInterval = setInterval(loadData, 60000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});

const loadData = async () => {
  await opsStore.loadAll();

  const year = new Date().getFullYear();
  try {
    const { data: hData } = await useFetch("/api/admin/holiday-rules", {
      query: { year },
    });
    if (hData.value && hData.value.occurrences) {
      holidays.value = hData.value.occurrences;
    }

    const { data: sData } = await useFetch("/api/admin/shift-records", {
      query: {
        start: activeDateRange.value.start,
        end: activeDateRange.value.end,
      },
    });
    if (sData.value) {
      shifts.value = sData.value;
    }
  } catch (e) {
    console.error(e);
  }
};
</script>
