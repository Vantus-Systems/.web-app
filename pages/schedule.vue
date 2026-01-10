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

const { chicagoTime, mode, customDate, customTime, initCustom, getStatus } =
  useScheduleClock();

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
  <div class="bg-white min-h-screen font-sans selection:bg-primary-100">
    <!-- Today Strip -->
    <div class="sticky top-0 z-50">
      <TodayStrip />
    </div>

    <!-- High-Fidelity Hero Section -->
    <div
      class="relative h-[45vh] min-h-[450px] flex items-center justify-center overflow-hidden bg-slate-900"
    >
      <div class="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=2000"
          class="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
          alt="Luxury Bingo Hall"
        />
        <div
          class="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-white"
        ></div>
      </div>

      <div class="container mx-auto px-4 relative z-10 text-center">
        <div
          class="inline-flex items-center gap-2 bg-gold-500/20 backdrop-blur-md border border-gold-500/30 px-4 py-2 rounded-full mb-6"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-gold-500"
            ></span>
          </span>
          <span
            class="text-xs font-black uppercase tracking-widest text-gold-100"
            >Live Schedule</span
          >
        </div>
        <h1
          class="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter"
        >
          Plan Your
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500"
            >Winning</span
          >
          Visit
        </h1>
        <p
          class="text-slate-200 max-w-2xl mx-auto text-lg md:text-xl font-medium opacity-90"
        >
          Experience the gold standard of bingo. Browse our curated sessions and
          plan your winning visit.
        </p>

        <div
          v-if="scheduleMeta?.lastPublishedAt"
          class="mt-4 text-xs text-slate-400 font-medium"
        >
          Updated
          {{ new Date(scheduleMeta.lastPublishedAt).toLocaleDateString() }}
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 -mt-20 relative z-20 pb-32">
      <!-- Next Up Card (if active) -->
      <div
        v-if="nextUpSession"
        class="mb-8 animate-in slide-in-from-bottom-4 duration-500"
      >
        <div
          class="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gold-500/5"></div>
          <div class="relative z-10 flex items-center gap-6">
            <div class="p-3 bg-gold-500 rounded-xl text-slate-900">
              <Clock class="w-8 h-8" />
            </div>
            <div>
              <div
                class="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1"
              >
                Coming Up Next
              </div>
              <div class="text-2xl font-black text-white">
                {{ nextUpSession.name }}
              </div>
              <div class="text-slate-400 font-medium">
                {{ nextUpSession.startTime }} • {{ nextUpSession.category }}
              </div>
            </div>
          </div>
          <div class="relative z-10">
            <!-- Just visual cue, scroll handled by finding card in list or minimal logic -->
            <a
              href="#"
              class="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              View Details <ArrowRight class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <!-- Time Travel Controls -->
      <div
        class="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 mb-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <div
              class="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              Current Time (Chicago)
            </div>
            <div class="text-lg font-black text-slate-900">
              {{ chicagoTime.dayOfWeek }} {{ chicagoTime.dateStr }}
              <span class="text-emerald-600"
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

        <div class="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
          <button
            class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
            :class="
              mode === 'now'
                ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="mode = 'now'"
          >
            Live Now
          </button>
          <button
            class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
            :class="
              mode === 'custom'
                ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
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
            class="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <input
            v-model="customTime"
            type="time"
            class="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      <!-- Smart Calendar Ribbon -->
      <div
        class="bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 mb-12 max-w-4xl mx-auto"
      >
        <div class="flex items-center overflow-x-auto no-scrollbar gap-2">
          <button
            v-for="day in days"
            :key="day.id"
            :class="[
              'flex-1 min-w-[120px] py-4 px-6 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1',
              activeDay === day.id
                ? 'bg-primary-900 text-white shadow-xl shadow-primary-900/20 scale-105 z-10'
                : 'hover:bg-slate-50 text-slate-500',
            ]"
            @click="selectDay(day.id)"
          >
            <span
              class="text-xs font-black uppercase tracking-widest opacity-60"
              >{{ day.label }}</span
            >
            <span class="text-lg font-black">{{ day.date }}</span>
          </button>
        </div>
      </div>

      <!-- Smart Filtering & View Mode -->
      <div
        class="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 max-w-5xl mx-auto"
      >
        <!-- Filter Pills -->
        <div
          class="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0"
        >
          <button
            v-for="filter in filters"
            :key="filter"
            :class="[
              'px-6 py-2 rounded-full text-sm font-black transition-all border',
              activeFilter === filter
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
            ]"
            @click="activeFilter = filter"
          >
            {{ filter }}
          </button>
        </div>

        <!-- View Switcher -->
        <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            class="p-2 rounded-md transition-colors"
            :class="
              viewMode === 'timeline'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            "
            title="Timeline View"
            @click="viewMode = 'timeline'"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
          <button
            class="p-2 rounded-md transition-colors"
            :class="
              viewMode === 'compact'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            "
            title="Compact List"
            @click="viewMode = 'compact'"
          >
            <List class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Event Cards Grid -->
      <div class="max-w-5xl mx-auto space-y-8">
        <div v-if="viewMode === 'timeline'">
          <TransitionGroup name="list" tag="div" class="space-y-8">
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
          class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
        >
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            class="border-b border-slate-100 last:border-0 p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-4">
              <div class="text-center w-20 shrink-0">
                <div class="text-lg font-black text-slate-900">
                  {{ session.startTime }}
                </div>
                <div class="text-xs font-bold text-slate-400 uppercase">
                  {{ session.category }}
                </div>
              </div>
              <div>
                <h3 class="font-bold text-slate-900">{{ session.name }}</h3>
                <div class="text-sm text-slate-500 line-clamp-1">
                  {{ session.description }}
                </div>
              </div>
            </div>
            <div class="shrink-0">
              <div
                class="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider"
              >
                {{ getStatus(session).label }}
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredSessions.length === 0"
          class="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
        >
          <CalendarIcon class="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 class="text-xl font-black text-slate-900 mb-2">
            No sessions found
          </h3>
          <p class="text-slate-500">
            Try adjusting your filters or selecting another day.
          </p>
          <button
            class="mt-6 text-primary-600 font-black hover:underline"
            @click="activeFilter = 'All'"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>

    <!-- Conversion Footer -->
    <div class="bg-slate-900 py-24 relative overflow-hidden">
      <div
        class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"
      ></div>
      <div class="container mx-auto px-4 relative z-10 text-center">
        <h2
          class="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter"
        >
          Ready to Join the <span class="text-gold-400">Action?</span>
        </h2>
        <p class="text-slate-400 max-w-2xl mx-auto text-xl mb-12 font-medium">
          Our premium sessions fill up fast. Secure your preferred seat today
          and experience the ultimate bingo atmosphere.
        </p>
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <NuxtLink
            to="/contact"
            class="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gold-500 text-primary-900 font-black text-lg hover:bg-gold-400 transition-all shadow-2xl shadow-gold-500/20"
          >
            Book a Group Reservation
          </NuxtLink>
          <NuxtLink
            to="/pricing"
            class="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/10 text-white font-black text-lg hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
          >
            View Pricing & Bundles
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Fine print -->
    <p
      class="text-center text-sm text-slate-400 italic py-12 max-w-3xl mx-auto"
    >
      *Family-friendly — 18+. Valid photo ID may be required for entry and prize
      claims. Closing time depends on daily activities.
    </p>
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
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

@keyframes slow-zoom {
  0% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1.15);
  }
}
.animate-slow-zoom {
  animation: slow-zoom 20s infinite alternate ease-in-out;
}
</style>
