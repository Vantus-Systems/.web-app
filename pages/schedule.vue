<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Calendar as CalendarIcon,
  Clock,
  List,
  LayoutGrid,
  ArrowRight,
} from "lucide-vue-next";
import { useBusiness } from "~/composables/useBusiness";
import { useScheduleClock } from "~/composables/useScheduleClock";
import { parseTime as parseTimeToMinutes } from "~/utils/time.utils";
import TodayStrip from "~/components/public/TodayStrip.vue";
import ScheduleEventCard from "~/components/ScheduleEventCard.vue";

const {
  business: BUSINESS_INFO,
  fetchBusiness,
  schedule: scheduleData,
  fetchSchedule,
} = useBusiness();
import { useAutoRefresh } from "~/composables/useBusiness";

const { chicagoTime, mode, customDate, customTime, initCustom, getStatus } =
  useScheduleClock();

const { startPolling, stopPolling } = useAutoRefresh(30);

onMounted(() => {
  startPolling(false);
});

onUnmounted(() => {
  stopPolling();
});

await fetchBusiness();
await fetchSchedule();

// Handle new response shape { sessions, meta } or legacy Array
const sessions = computed(() => {
  if (Array.isArray(scheduleData.value)) return scheduleData.value;
  return scheduleData.value?.sessions || [];
});

const scheduleMeta = computed(() => {
  if (Array.isArray(scheduleData.value)) return null;
  return scheduleData.value?.meta || null;
});

type Day = {
  id: string;
  label: string;
  date: string;
  dayOfWeek: string;
};

const days = computed<Day[]>(() => {
  const refDateStr =
    mode.value === "custom" && customDate.value
      ? customDate.value
      : new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
  const refDate = new Date(refDateStr);

  const dateFmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
  });
  const weekdayShort = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const weekdayLong = new Intl.DateTimeFormat(undefined, { weekday: "long" });

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() + i);

    const id = d.toISOString().slice(0, 10);
    let label = weekdayLong.format(d);

    if (mode.value === "now") {
      if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";
    }

    const dayOfWeek = weekdayShort.format(d);

    return {
      id,
      label,
      date: dateFmt.format(d),
      dayOfWeek,
    };
  });
});

const activeDay = ref("today");

// Initialize activeDay
watch(
  [() => days.value, mode],
  () => {
    if (mode.value === "custom" && customDate.value) {
      activeDay.value = customDate.value;
    } else if (days.value.length > 0) {
      const first = days.value[0];
      if (first) {
        activeDay.value = first.id;
      }
    }
  },
  { immediate: true },
);

const selectDay = (dayId: string) => {
  activeDay.value = dayId;
  if (mode.value === "custom") {
    customDate.value = dayId;
  }
};

const activeFilter = ref("All");
const filters = ["All", "Morning", "Afternoon", "Evening"];
const viewMode = ref<"timeline" | "compact">("timeline");

const filteredSessions = computed(() => {
  const currentDay = days.value.find((d) => d.id === activeDay.value);
  const dayOfWeek = currentDay?.dayOfWeek || "Mon";

  let filtered = sessions.value.filter((s: any) =>
    s.availableDays.includes(dayOfWeek),
  );

  if (activeFilter.value !== "All") {
    filtered = filtered.filter((s: any) => s.category === activeFilter.value);
  }

  // Sort by start time
  filtered.sort((a: any, b: any) => {
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
  });

  return filtered;
});

const activeDayOfWeek = computed(() => {
  const found = days.value.find((d) => d.id === activeDay.value);
  return found ? found.dayOfWeek : "Mon";
});

// Program Fetching
const programCache = ref<Record<string, any>>({});
const fetchPrograms = async () => {
  const slugs = new Set<string>();
  filteredSessions.value.forEach((s: any) => {
    if (s.programSlug) slugs.add(s.programSlug);
  });

  for (const slug of slugs) {
    if (!programCache.value[slug]) {
      try {
        const prog = await $fetch(`/api/programs/${slug}`);
        programCache.value[slug] = prog;
      } catch (e) {
        console.error(`Failed to fetch program ${slug}`, e);
      }
    }
  }
};

watch(
  filteredSessions,
  () => {
    fetchPrograms();
  },
  { immediate: true },
);

// Next Up Card Logic
const nextUpSession = computed(() => {
  const nowMins = chicagoTime.value.minutes;
  // Assume days[0] is Today for simplified logic if not using Time Travel heavily
  // Only show Next Up if we are on "Today" view or very close to it.
  if (activeDay.value !== days.value[0].id) return null;

  // Find next session today
  const upcoming = filteredSessions.value.find(
    (s: any) => parseTimeToMinutes(s.startTime) > nowMins,
  );
  // Or if currently active?
  // Let's stick to upcoming for "Next Up"
  return upcoming || null;
});

useSeoMeta({
  title: "Schedule | Mary Esther Bingo",
  description: `View our general schedule at ${BUSINESS_INFO.value.name}. Sessions are offered daily.`,
});
</script>

<template>
  <div class="bg-richBlack min-h-screen font-sans selection:bg-primary/20 text-white">
    <!-- Today Strip -->
    <div class="sticky top-0 z-50">
      <TodayStrip />
    </div>

    <!-- High-Fidelity Hero Section -->
    <div
      class="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-black border-b border-primary/10"
    >
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,221,97,0.15),transparent_70%)]"></div>
        <div class="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10 text-center">
        <div
          v-motion-pop-visible-once
          class="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-md border border-primary/20 px-6 py-2 rounded-full mb-10"
        >
          <span class="relative flex h-3 w-3">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-3 w-3 bg-primary"
            ></span>
          </span>
          <span
            class="text-[10px] font-black uppercase tracking-[0.4em] text-primary"
            >Live Schedule</span
          >
        </div>
        <h1
          v-motion-fade-visible-once
          class="text-6xl md:text-[10rem] font-black text-white mb-8 tracking-tighter uppercase leading-none"
        >
          Plan Your
          <span
            class="text-primary italic drop-shadow-[0_0_30px_rgba(78,221,97,0.4)]"
            >Visit</span
          >
        </h1>
        <p
          v-motion-fade-visible-once
          class="text-zinc-400 max-w-3xl mx-auto text-xl md:text-3xl font-bold uppercase tracking-widest leading-tight"
        >
          Strategic sessions. <span class="text-white">High-stakes games.</span>
        </p>

        <div
          v-if="scheduleMeta?.lastPublishedAt"
          class="mt-12 text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em]"
        >
          SYNCED:
          {{ new Date(scheduleMeta.lastPublishedAt).toLocaleDateString() }}
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 -mt-32 relative z-20 pb-40">
      <!-- Next Up Card (if active) -->
      <div
        v-if="nextUpSession"
        class="mb-12"
      >
        <div
          class="bg-charcoal border-4 border-primary rounded-[3rem] p-10 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group"
        >
          <div class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity duration-1000"></div>
          <div class="relative z-10 flex items-center gap-10">
            <div class="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(78,221,97,0.3)]">
              <Clock class="w-10 h-10" />
            </div>
            <div>
              <div
                class="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4"
              >
                Up Next: Next Session
              </div>
              <div class="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2">
                {{ nextUpSession.name }}
              </div>
              <div class="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                {{ nextUpSession.startTime }} Start • {{ nextUpSession.category }} Tier
              </div>
            </div>
          </div>
          <div class="relative z-10">
            <a
              href="#session-list"
              class="px-12 py-6 bg-primary hover:bg-white text-black rounded-full font-black uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3 shadow-[0_20px_50px_rgba(78,221,97,0.25)]"
            >
              View Program <ArrowRight class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <!-- Time Travel Controls -->
      <div
        class="bg-charcoal border border-zinc-900 rounded-[2.5rem] p-6 mb-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto"
      >
        <div class="flex items-center gap-6">
          <div class="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-primary border border-zinc-800">
            <Clock class="w-6 h-6" />
          </div>
          <div>
            <div
              class="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1"
            >
              Market Time (Chicago)
            </div>
            <div class="text-xl font-black text-white">
              {{ chicagoTime.dayOfWeek }} {{ chicagoTime.dateStr }}
              <span class="text-primary"
                >{{
                  Math.floor(chicagoTime.minutes / 60)
                    .toString()
                    .padStart(2, "0")
                }}:{{
                  (chicagoTime.minutes % 60).toString().padStart(2, "0")
                }}</span
              >
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-black p-1.5 rounded-2xl border border-zinc-900">
          <button
            class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            :class="
              mode === 'now'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'text-zinc-500 hover:text-white'
            "
            @click="mode = 'now'"
          >
            Live Feed
          </button>
          <button
            class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            :class="
              mode === 'custom'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'text-zinc-500 hover:text-white'
            "
            @click="
              initCustom();
              mode = 'custom';
            "
          >
            Time Travel
          </button>
        </div>

        <div
          v-if="mode === 'custom'"
          class="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <input
            v-model="customDate"
            type="date"
            class="px-4 py-2.5 rounded-xl bg-black border border-zinc-800 text-xs font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
          <input
            v-model="customTime"
            type="time"
            class="px-4 py-2.5 rounded-xl bg-black border border-zinc-800 text-xs font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      <!-- Smart Calendar Ribbon -->
      <div
        class="bg-charcoal border border-zinc-900 rounded-[3rem] p-3 mb-16 max-w-5xl mx-auto shadow-2xl overflow-hidden"
      >
        <div class="flex items-center overflow-x-auto no-scrollbar gap-2 px-2 py-1">
          <button
            v-for="day in days"
            :key="day.id"
            :class="[
              'flex-1 min-w-[140px] py-6 px-10 rounded-[2rem] transition-all duration-500 flex flex-col items-center gap-2',
              activeDay === day.id
                ? 'bg-primary text-black shadow-[0_15px_40px_rgba(78,221,97,0.3)] scale-[1.02] z-10'
                : 'hover:bg-black/40 text-zinc-500 hover:text-white',
            ]"
            @click="selectDay(day.id)"
          >
            <span
              class="text-[10px] font-black uppercase tracking-[0.3em]"
              :class="activeDay === day.id ? 'opacity-70' : 'opacity-40'"
              >{{ day.label }}</span
            >
            <span class="text-2xl font-black uppercase tracking-tighter">{{ day.date }}</span>
          </button>
        </div>
      </div>

      <!-- Smart Filtering & View Mode -->
      <div
        class="flex flex-col md:flex-row items-center justify-between gap-8 mb-20 max-w-5xl mx-auto border-b border-zinc-900 pb-12"
      >
        <!-- Filter Pills -->
        <div
          class="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0"
        >
          <button
            v-for="filter in filters"
            :key="filter"
            :class="[
              'px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-2',
              activeFilter === filter
                ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(78,221,97,0.2)]'
                : 'bg-transparent text-zinc-500 border-zinc-900 hover:border-zinc-700 hover:text-white',
            ]"
            @click="activeFilter = filter"
          >
            {{ filter }}
          </button>
        </div>

        <!-- View Switcher -->
        <div class="flex items-center gap-2 bg-black p-1.5 rounded-xl border border-zinc-900">
          <button
            class="p-3 rounded-lg transition-all duration-300"
            :class="
              viewMode === 'timeline'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'text-zinc-600 hover:text-zinc-300'
            "
            title="Timeline Matrix"
            @click="viewMode = 'timeline'"
          >
            <LayoutGrid class="w-5 h-5" />
          </button>
          <button
            class="p-3 rounded-lg transition-all duration-300"
            :class="
              viewMode === 'compact'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'text-zinc-600 hover:text-zinc-300'
            "
            title="Compact Stream"
            @click="viewMode = 'compact'"
          >
            <List class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Event Cards Grid -->
      <div class="max-w-5xl mx-auto space-y-12">
        <div v-if="viewMode === 'timeline'">
          <TransitionGroup name="list" tag="div" class="space-y-10">
            <ScheduleEventCard
              v-for="(session, idx) in filteredSessions"
              :key="session.id"
              :session="session"
              :index="idx"
              :active-day-of-week="activeDayOfWeek"
              :program="
                session.programSlug
                  ? programCache[session.programSlug]
                  : undefined
              "
              :status="getStatus(session)"
            />
          </TransitionGroup>
        </div>

        <div
          v-else
          class="bg-charcoal rounded-[3rem] border border-zinc-900 overflow-hidden shadow-2xl"
        >
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            class="border-b border-zinc-900 last:border-0 p-8 md:p-12 hover:bg-black/40 transition-all duration-500 flex items-center justify-between gap-8 group"
          >
            <div class="flex items-center gap-10">
              <div class="text-center w-24 shrink-0">
                <div class="text-3xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                  {{ session.startTime }}
                </div>
                <div class="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">
                  {{ session.category }}
                </div>
              </div>
              <div>
                <h3 class="font-black text-2xl text-white uppercase tracking-tighter mb-2">{{ session.name }}</h3>
                <div class="text-sm font-bold text-zinc-500 line-clamp-1">
                  {{ session.description }}
                </div>
              </div>
            </div>
            <div class="shrink-0">
              <div
                class="px-6 py-2 bg-black border border-zinc-800 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] group-hover:border-primary/40 transition-all"
              >
                {{ getStatus(session).label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredSessions.length === 0"
          v-motion-fade-visible-once
          class="text-center py-48 bg-charcoal rounded-[4rem] border-2 border-dashed border-zinc-900"
        >
          <div class="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-800">
             <CalendarIcon class="w-10 h-10 text-zinc-700" />
          </div>
          <h3 class="text-4xl font-black text-white uppercase tracking-tighter mb-4">No Sessions Active</h3>
          <p class="text-zinc-500 font-bold max-w-md mx-auto text-lg">
            Operational silence for this configuration. Select another date or tier.
          </p>
        </div>
      </div>
    </div>

    <!-- Conversion Footer -->
    <div class="bg-black py-40 border-t border-primary/10 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(78,221,97,0.05),transparent_50%)]"></div>
      <div class="container mx-auto px-4 relative z-10 text-center">
        <h2
          v-motion-slide-bottom
          class="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase"
        >
          Ready to <span class="text-primary italic">Win?</span>
        </h2>
        <p class="text-zinc-400 max-w-3xl mx-auto text-xl md:text-2xl mb-16 font-bold uppercase tracking-widest leading-relaxed">
          The arena is set. The prize pools are surging. <br/>
          <span class="text-white">Claim your seat now.</span>
        </p>
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <NuxtLink
            to="/contact"
            class="group w-full sm:w-auto px-12 py-6 rounded-full bg-primary text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_20px_50px_rgba(78,221,97,0.3)] flex items-center justify-center gap-3"
          >
            Contact Us <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
          <NuxtLink
            to="/pricing"
            class="w-full sm:w-auto px-12 py-6 rounded-full bg-charcoal text-white font-black text-sm uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all border border-zinc-800 flex items-center justify-center"
          >
            Session Info
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Fine print -->
    <div class="bg-richBlack py-12 border-t border-zinc-900">
        <p
          class="text-center text-[10px] text-zinc-600 font-black uppercase tracking-[0.5em] max-w-3xl mx-auto px-4"
        >
          Official Schedule // Valid ID Required // 18+ Only // The house maintains absolute discretion on all prize claims and scheduling.
        </p>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}
</style>
