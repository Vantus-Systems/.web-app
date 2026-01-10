<template>
  <div
    class="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
  >
    <div class="bg-primary-600 px-6 py-4 flex items-center justify-between">
      <h3 class="text-white font-bold text-lg uppercase tracking-wider">
        Up Next
      </h3>
      <span
        class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        :class="statusColor"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div class="p-6">
      <div v-if="nextSession">
        <h4 class="text-2xl font-bold text-primary-900 mb-2">
          {{ nextSession.name }}
        </h4>
        <p class="text-slate-500 mb-6 text-sm">{{ nextSession.description }}</p>

        <div class="space-y-3 text-slate-600 mb-6">
          <div
            class="flex justify-between items-center border-b border-slate-100 pb-2"
          >
            <span class="text-sm font-medium">Start Time</span>
            <span class="font-bold text-primary-700">{{
              nextSession.startTime
            }}</span>
          </div>
          <div
            class="flex justify-between items-center border-b border-slate-100 pb-2"
          >
            <span class="text-sm font-medium">End Time</span>
            <span class="font-bold text-primary-700">{{
              nextSession.endTime
            }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Category</span>
            <span class="font-bold text-primary-700">{{
              nextSession.category
            }}</span>
          </div>
        </div>

        <div class="text-center bg-slate-50 rounded-lg p-3 mb-4">
          <span
            class="block text-xs text-slate-500 uppercase tracking-widest mb-1"
            >{{ countdownLabel }}</span
          >
          <span class="text-2xl font-mono font-bold text-primary-600">{{
            countdown
          }}</span>
        </div>

        <NuxtLink to="/schedule" class="block">
          <button
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-sm"
          >
            View Schedule
          </button>
        </NuxtLink>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-slate-500 mb-4">No more sessions today.</p>
        <NuxtLink to="/schedule">
          <button
            class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition-colors uppercase tracking-wider text-sm"
          >
            View Full Schedule
          </button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBusiness } from "~/composables/useBusiness";
import { useScheduleClock } from "~/composables/useScheduleClock";
import { normalizeDay } from "~/utils/normalizeDay";
import { parseTime } from "~/utils/time.utils";

const { schedule } = useBusiness();
const { chicagoTime } = useScheduleClock(1000);

const sessions = computed(() => {
  const raw = schedule.value;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : raw.sessions || [];
});

const todayName = computed(() => normalizeDay(chicagoTime.value.dayOfWeek));

const nextSession = computed(() => {
  if (!sessions.value.length) return null;

  const nowMins = chicagoTime.value.minutes;

  // Filter for today's sessions
  const todaySessions = sessions.value.filter((s: any) =>
    s.availableDays.includes(todayName.value),
  );

  if (!todaySessions.length) return null;

  // Find first session that ends AFTER now (so we include currently running ones)
  // We need to handle overnight sessions? Assuming no for now based on data.

  // Sort by start time
  todaySessions.sort(
    (a: any, b: any) => parseTime(a.startTime) - parseTime(b.startTime),
  );

  // Find first where endTime > now
  const upcoming = todaySessions.find((s: any) => {
    const end = parseTime(s.endTime);
    // Handle wrap around midnight if needed, but assuming simple day schedule
    return end > nowMins;
  });

  return upcoming || null;
});

const isLive = computed(() => {
  if (!nextSession.value) return false;
  const nowMins = chicagoTime.value.minutes;
  const start = parseTime(nextSession.value.startTime);
  const end = parseTime(nextSession.value.endTime);
  return nowMins >= start && nowMins < end;
});

const statusLabel = computed(() => {
  if (!nextSession.value) return "Closed";
  return isLive.value ? "Live Now" : "Up Next";
});

const statusColor = computed(() => {
  if (!nextSession.value) return "bg-slate-100 text-slate-500";
  return isLive.value
    ? "bg-red-100 text-red-700 animate-pulse"
    : "bg-green-100 text-green-700";
});

const countdownLabel = computed(() => {
  if (!nextSession.value) return "";
  return isLive.value ? "Ends In" : "Starts In";
});

const countdown = computed(() => {
  if (!nextSession.value) return "--:--:--";

  const nowMins = chicagoTime.value.minutes; // This updates every minute
  // Ideally we want second-level precision, but useScheduleClock updates minutely.
  // For better countdown, we might need a local interval or seconds in useScheduleClock.
  // `useScheduleClock` updates `now` every minute.
  // Let's rely on minutes for now or add local seconds.

  const targetMins = isLive.value
    ? parseTime(nextSession.value.endTime)
    : parseTime(nextSession.value.startTime);

  let diff = targetMins - nowMins;
  if (diff < 0) diff = 0; // Should be covered by logic

  const h = Math.floor(diff / 60);
  const m = diff % 60;

  return `${h}h ${m}m`;
});
</script>
