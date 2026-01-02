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
        v-if="schema"
        :range="activeDateRange"
        :weekday-defaults="schema.calendar?.weekdayDefaults || {}"
        :assignments="schema.calendar?.assignments || {}"
        :overrides="schema.calendar?.overrides || {}"
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
  <div
    class="h-screen w-screen bg-black text-white flex flex-col overflow-hidden"
  >
    <div
      class="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between"
    >
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tight text-white">
          Mary Esther Bingo <span class="text-amber-400">Schedule</span>
        </h1>
        <p class="text-slate-400 font-bold uppercase tracking-widest mt-1">
          Upcoming Days
        </p>
      </div>
      <div class="text-right">
        <div class="text-4xl font-mono font-bold text-emerald-400">
          {{ time }}
        </div>
        <div class="text-sm font-bold text-slate-500 uppercase">{{ date }}</div>
      </div>
    </div>

    <div class="flex-1 p-6 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"
        ></div>
      </div>

      <div
        v-else-if="schedule.length === 0"
        class="flex items-center justify-center h-full text-slate-500 font-bold uppercase tracking-widest"
      >
        No upcoming days scheduled.
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full overflow-y-auto"
      >
        <div
          v-for="day in schedule"
          :key="day.date"
          class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col"
        >
          <div
            class="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between"
          >
            <span class="text-xl font-black uppercase">
              {{ day.dayOfWeek }}
            </span>
            <span class="text-sm font-bold text-slate-400">
              {{ day.dateDisplay }}
            </span>
          </div>

          <div
            class="p-6 flex-1 flex flex-col justify-center items-center text-center space-y-2"
          >
            <div
              v-if="day.isHoliday"
              class="text-amber-500 font-black uppercase tracking-widest text-lg"
            >
              {{ day.holidayName || "Holiday" }}
            </div>

            <div
              v-else-if="day.status === 'closed'"
              class="text-slate-400 font-black uppercase tracking-widest"
            >
              Closed
            </div>

            <div v-else-if="day.profile">
              <div class="text-2xl font-bold text-white mb-2">
                {{ day.profile.name }}
              </div>
              <div
                class="px-3 py-1 bg-slate-700 rounded text-slate-300 font-mono text-lg"
              >
                {{ day.profile.time }}
              </div>
            </div>

            <div
              v-else
              class="text-slate-500 font-bold uppercase tracking-widest"
            >
              Open
            </div>
          </div>
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { resolveEffectiveAssignment } from "~/utils/schedule-calendar";
import { useOpsStore } from "~/stores/ops";
import type { OpsSchemaDayProfile, OpsSchemaV2 } from "~/types/ops-schema";

definePageMeta({
  layout: "blank",
});

type TvDay = {
  date: string;
  dateDisplay: string;
  dayOfWeek: string;
  status: "open" | "closed";
  isHoliday: boolean;
  holidayName?: string;
  profile?: { name: string; time: string };
};

const opsStore = useOpsStore();
const holidays = ref<any[]>([]);
const shifts = ref<any[]>([]);
const currentTime = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");

const schema = computed(() => {
  return opsStore.opsSchemaLive || opsStore.opsSchemaDraft;
});

const activeDateRange = computed(() => {
  return (
    schema.value?.calendar?.range || {
      start: `${new Date().getFullYear()}-01-01`,
      end: `${new Date().getFullYear()}-12-31`,
    }
  );
});

const dayProfiles = computed(() => schema.value?.dayProfiles ?? []);

let pollInterval: ReturnType<typeof setInterval> | null = null;

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
      credentials: "include",
    });
    if (hData.value && hData.value.occurrences) {
      holidays.value = hData.value.occurrences;
    }

    const { data: sData } = await useFetch("/api/admin/shift-records", {
      query: {
        start: activeDateRange.value.start,
        end: activeDateRange.value.end,
      },
      credentials: "include",
    });
    if (sData.value) {
      shifts.value = sData.value;
    }
  } catch (e) {
    console.error(e);
  }
};

const loading = ref(true);
const schedule = ref<TvDay[]>([]);
const holidayOccurrences = ref<any[]>([]);

const time = ref("");
const date = ref("");
let clockTimer: any;
let refreshTimer: any;

const holidayMap = computed(() => {
  const map: Record<string, { name: string; closureType?: string }> = {};
  for (const h of holidayOccurrences.value || []) {
    if (h?.date) {
      map[h.date] = { name: h.name, closureType: h.closureType };
    }
  }
  return map;
});

const updateClock = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  date.value = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const loadHolidays = async () => {
  const year = new Date().getFullYear();
  try {
    const res = await $fetch<any>("/api/admin/holiday-rules", {
      query: { year },
      credentials: "include",
    });
    holidayOccurrences.value = res?.occurrences || [];
  } catch {
    holidayOccurrences.value = [];
  }
};

const computeSchedule = () => {
  const schema = (opsStore.opsSchemaLive || opsStore.opsSchemaDraft) as
    | OpsSchemaV2
    | undefined;

  if (!schema?.calendar) {
    schedule.value = [];
    return;
  }

  const calendar = schema.calendar;
  const profiles = (schema.dayProfiles || []) as OpsSchemaDayProfile[];

  const today = new Date();
  const days: TvDay[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);

    const hol = holidayMap.value[iso];
    const isHoliday = !!hol && hol.closureType === "CLOSED";

    const eff = resolveEffectiveAssignment(calendar as any, iso);
    const status: "open" | "closed" =
      isHoliday || eff.status === "closed" ? "closed" : "open";

    let profile: TvDay["profile"];
    if (status === "open" && eff.effectiveProfileId) {
      const p = profiles.find((x) => x.id === eff.effectiveProfileId);
      if (p) {
        profile = {
          name: p.name,
          time: p.doors_open_time ? `Doors: ${p.doors_open_time}` : p.category,
        };
      }
    }

    days.push({
      date: iso,
      dateDisplay: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      dayOfWeek: d.toLocaleDateString("en-US", { weekday: "long" }),
      status,
      isHoliday,
      holidayName: hol?.name,
      profile,
    });
  }

  schedule.value = days;
};

const load = async () => {
  loading.value = true;
  try {
    await opsStore.loadAll();
    await loadHolidays();
    computeSchedule();
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);

  await load();
  refreshTimer = setInterval(load, 60_000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>
