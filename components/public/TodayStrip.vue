<script setup lang="ts">
import { computed } from "vue";
import { Clock, MapPin, CalendarPlus, Phone, Activity } from "lucide-vue-next";
import { useBusiness } from "~/composables/useBusiness";
import { useScheduleClock } from "~/composables/useScheduleClock";
import { normalizeDay } from "~/utils/normalizeDay";

const { business: BUSINESS_INFO, schedule } = useBusiness();
const { chicagoTime } = useScheduleClock();

const sessions = computed(() => {
  const raw = schedule.value;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : raw.sessions || [];
});

const nextSession = computed(() => {
  if (!sessions.value.length) return null;
  const nowMins = chicagoTime.value.minutes;
  const todayName = normalizeDay(chicagoTime.value.dayOfWeek);
  
  const todaySessions = sessions.value.filter((s: any) =>
    s.availableDays.includes(todayName),
  );

  todaySessions.sort(
    (a: any, b: any) => parseTime(a.startTime) - parseTime(b.startTime),
  );

  const upcoming = todaySessions.find(
    (s: any) => parseTime(s.startTime) > nowMins,
  );

  return upcoming || todaySessions[0];
});

const doorsOpenText = computed(() => {
  if (!nextSession.value) return "MANIFEST: CHECK SCHEDULE";
  const startMins = parseTime(nextSession.value.startTime);
  const doorsMins = startMins - 60;
  return `DOORS: ${formatTime(doorsMins)}`;
});

const specialText = computed(() => {
  return "TACTICAL SPECIALS DEPLOYED";
});

const addToCalendar = () => {
  const router = useRouter();
  router.push("/schedule");
};

const mapLink = computed(
  () => BUSINESS_INFO.value.address?.mapLink || "https://maps.google.com",
);
const phoneLink = computed(
  () => `tel:${BUSINESS_INFO.value.contact?.phonePlain || ""}`,
);
</script>

<template>
  <div
    class="bg-[#050505] border-b border-white/5 text-white relative z-40 py-2.5 overflow-hidden"
  >
    <!-- Grid Trace Pattern -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/images/dots.png')] bg-[size:20px]"></div>
    
    <div class="container mx-auto px-4 relative z-10">
      <div
        class="flex flex-col lg:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.2em]"
      >
        <!-- Left: Status Ticker -->
        <div
          class="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-start"
        >
          <div class="flex items-center gap-3 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Activity class="w-3 h-3 text-primary animate-pulse" />
            <span class="text-primary tracking-[0.3em]">
               <span v-if="nextSession">
                  INBOUND: {{ nextSession.name }} // {{ nextSession.startTime }}
               </span>
               <span v-else>LIVE OPERATIONS</span>
            </span>
          </div>
          
          <div class="flex items-center gap-3 text-zinc-500">
            <Clock class="w-3.5 h-3.5 text-zinc-700" />
            <span class="font-bold">{{ doorsOpenText }}</span>
          </div>
        </div>

        <!-- Center: Comms -->
        <div class="hidden xl:flex items-center gap-4 text-zinc-600">
            <div class="w-1 h-1 bg-zinc-800 rounded-full"></div>
            <span class="tracking-[0.4em] font-black">{{ specialText }}</span>
            <div class="w-1 h-1 bg-zinc-800 rounded-full"></div>
        </div>

        <!-- Right: Field Ops -->
        <div class="flex items-center gap-8 w-full lg:w-auto justify-center lg:justify-end">
          <a
            :href="mapLink"
            target="_blank"
            class="group flex items-center gap-2.5 text-zinc-500 hover:text-white transition-all"
          >
            <MapPin class="w-3.5 h-3.5 text-zinc-700 group-hover:text-primary transition-colors" />
            <span class="font-black">{{ BUSINESS_INFO?.address?.city || 'BASE OPS' }}</span>
          </a>
          
          <a
            :href="phoneLink"
            class="group flex items-center gap-2.5 text-zinc-500 hover:text-white transition-all"
          >
            <Phone class="w-3.5 h-3.5 text-zinc-700 group-hover:text-primary transition-colors" />
            <span class="font-black lowercase tracking-widest">{{ BUSINESS_INFO?.contact?.phone || 'COMMS' }}</span>
          </a>

          <button
            @click="addToCalendar"
            class="bg-zinc-900 border border-zinc-800 hover:border-primary hover:text-primary text-zinc-400 text-[9px] font-black px-5 py-1.5 rounded-md transition-all uppercase tracking-[0.3em]"
          >
            Full Schedule
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
