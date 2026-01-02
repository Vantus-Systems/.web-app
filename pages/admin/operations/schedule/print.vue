<template>
  <div class="min-h-screen bg-white text-slate-900 p-4 print:p-0">
    <div class="mb-4 print:hidden flex justify-between items-center">
      <h1 class="text-2xl font-bold">Schedule Print View</h1>
      <button
        class="bg-primary-600 text-white px-4 py-2 rounded shadow hover:bg-primary-700"
        @click="print"
      >
        Print Now
      </button>
    </div>

    <div class="border border-slate-200 rounded-lg overflow-hidden">
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
        class="print-canvas"
      />
      <div v-else class="p-8 text-center text-slate-500">
        Loading Schedule...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useOpsStore } from "~/stores/ops";
import ScheduleCanvas from "~/components/admin/schedule/ScheduleCanvas.vue";

const opsStore = useOpsStore();
const holidays = ref<any[]>([]);
const shifts = ref<any[]>([]);

const activeDateRange = computed(() => {
  return (
    opsStore.opsSchemaDraft?.calendar.range || {
      start: new Date().getFullYear() + "-01-01",
      end: new Date().getFullYear() + "-12-31",
    }
  );
});

const dayProfiles = computed(() => opsStore.opsSchemaDraft?.dayProfiles ?? []);

const print = () => {
  window.print();
};

onMounted(async () => {
  await opsStore.loadAll();

  // Fetch holidays & shifts
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

  // Auto print if requested?
  // window.print();
});
</script>

<style>
@media print {
  .print-canvas {
    height: auto !important;
    overflow: visible !important;
  }
  /* Hide scrollbars/headers if needed */
}
</style>
