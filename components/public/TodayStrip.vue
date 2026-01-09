<script setup lang="ts">
import { computed } from "vue";
import { Clock, MapPin, CalendarPlus, Phone } from "lucide-vue-next";
import { useBusiness } from "~/composables/useBusiness";
import { useScheduleClock } from "~/composables/useScheduleClock";
import { parseTime, formatTime } from "~/utils/time.utils";

const { business: BUSINESS_INFO, schedule } = useBusiness();
const { chicagoTime } = useScheduleClock();

// We need to find the "Next" session based on chicagoTime.
// Sessions are in `schedule.value` (array or { sessions }).
// We need to parse their times.

const sessions = computed(() => {
  const raw = schedule.value;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : raw.sessions || [];
});

const nextSession = computed(() => {
  if (!sessions.value.length) return null;

  // Simple logic: find first session where start time > current time
  // Assuming sessions are for "Today" (from schedule API logic).
  // But schedule API returns a week usually?
  // Wait, `server/api/schedule.get.ts` returns slots for available days.
  // It returns a generic list of recurring sessions.
  // We need to map them to Today.

  const nowMins = chicagoTime.value.minutes;
  const todayName = chicagoTime.value.dayOfWeek; // e.g. "Friday"

  // Filter sessions active today
  const todaySessions = sessions.value.filter((s: any) =>
    s.availableDays.includes(todayName)
  );

  // Sort by time
  todaySessions.sort((a: any, b: any) => parseTime(a.startTime) - parseTime(b.startTime));

  // Find first one starting after now
  // Or if now is active? (Doors open?)
  // Let's just say "Next" is the first one that hasn't ended?
  // Or strictly starts after now?
  // "Live / Next session"

  // Let's find one that starts in future
  const upcoming = todaySessions.find((s: any) => parseTime(s.startTime) > nowMins);

  // If none upcoming today, maybe show first of tomorrow? (Not implemented for simplicity, just show "See Schedule")
  // Or show the *active* one if we are in it?

  // Check if we are inside a session?
  // Duration is not always in public API, but we have `endTime`.
  // parseTime(endTime) might handle 12h format.

  // Let's stick to "Next Session" or "Doors Open"
  return upcoming || todaySessions[0]; // Fallback to first of today (e.g. if early morning or late night looking at today)
});

const doorsOpenText = computed(() => {
    if (!nextSession.value) return "Check Schedule";
    // Heuristic: Doors open 90 mins before first session? Or 60?
    // Let's say 1 hour before.
    const startMins = parseTime(nextSession.value.startTime);
    const doorsMins = startMins - 60;
    return `Doors open ${formatTime(doorsMins)}`;
});

const specialText = computed(() => {
    // If we had pricing specials loaded in business store (we do via pricing fetch in consumers)
    // We could show it here.
    // For now, hardcode or generic.
    return "Daily Specials Available";
});

const addToCalendar = () => {
    // Navigate to schedule or trigger download
    // For the strip, simplest is link to schedule
    const router = useRouter();
    router.push('/schedule');
};

const mapLink = computed(() => BUSINESS_INFO.value.address?.mapLink || "https://maps.google.com");
const phoneLink = computed(() => `tel:${BUSINESS_INFO.value.contact?.phonePlain || ''}`);

</script>

<template>
  <div class="bg-slate-900 border-b border-gold-500/30 text-white relative z-40">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center justify-between py-2 md:h-12 gap-2 md:gap-4 text-sm">

        <!-- Left: Status -->
        <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div class="flex items-center gap-2 text-gold-400 font-bold">
            <Clock class="w-4 h-4" />
            <span v-if="nextSession">
              Next: {{ nextSession.name }} @ {{ nextSession.startTime }}
            </span>
            <span v-else>
              See Schedule
            </span>
          </div>
          <div class="hidden sm:block w-px h-4 bg-slate-700"></div>
          <div class="text-slate-400 text-xs sm:text-sm">
            {{ doorsOpenText }}
          </div>
        </div>

        <!-- Center: Promo (Desktop only or tiny mobile) -->
        <div class="hidden lg:block text-slate-300 font-medium">
          <span class="text-emerald-400 font-bold">Today:</span> {{ specialText }}
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-4 w-full md:w-auto justify-center border-t border-slate-800 pt-2 md:pt-0 md:border-t-0">
           <a :href="phoneLink" class="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
             <Phone class="w-3.5 h-3.5" />
             <span class="hidden sm:inline">Call</span>
           </a>

           <a :href="mapLink" target="_blank" class="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
             <MapPin class="w-3.5 h-3.5" />
             <span class="hidden sm:inline">Directions</span>
           </a>

           <button @click="addToCalendar" class="flex items-center gap-1.5 text-gold-400 hover:text-gold-300 transition-colors font-bold">
             <CalendarPlus class="w-3.5 h-3.5" />
             <span class="hidden sm:inline">Plan Visit</span>
             <span class="sm:hidden">Plan</span>
           </button>
        </div>

      </div>
    </div>
  </div>
</template>
