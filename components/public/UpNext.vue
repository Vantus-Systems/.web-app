<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Clock, Play, ArrowRight } from "lucide-vue-next";

// Fetch next session using public endpoint that now reads active admin schedule version
const next = ref<any>(null);
const pending = ref(true);
const error = ref<string | null>(null);

const fetchNext = async () => {
  try {
    pending.value = true;
    error.value = null;
    const data = await $fetch("/api/next-session");
    next.value = data;
  } catch (e: any) {
    console.error("Failed to fetch next session", e);
    error.value = e?.message || "Unable to load";
  } finally {
    pending.value = false;
  }
};

// Countdown based on server-provided ISO start timestamp
const timeLeftMs = ref(0);
const pad = (num: number) => String(num).padStart(2, "0");
let intervalId: any = null;

const startCountdown = () => {
  stopCountdown();
  intervalId = setInterval(() => {
    const startAt = next.value?.startAt ? new Date(next.value.startAt) : null;
    const now = new Date();
    const diff = startAt ? startAt.getTime() - now.getTime() : 0;
    timeLeftMs.value = Math.max(0, diff);
    if (diff <= 0) {
      // Event started → immediately fetch the next one
      fetchNext();
    }
  }, 1000);
};

const stopCountdown = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const countdown = computed(() => {
  const ms = timeLeftMs.value;
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
});

const title = computed(() => next.value?.programName || "Bingo Session");
const ctaLink = computed(() => {
  return next.value?.programSlug ? `/programs/${next.value.programSlug}` : "/schedule";
});

onMounted(async () => {
  await fetchNext();
  startCountdown();
  // Refresh next session every 30s to stay current with admin updates
  pollId = setInterval(fetchNext, 30_000);
});

onUnmounted(() => {
  stopCountdown();
  if (pollId) clearInterval(pollId);
});

let pollId: any = null;
</script>

<template>
  <section class="py-20 bg-charcoal relative overflow-hidden">
    <div
      class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(78,221,97,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(78,221,97,0.08),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(78,221,97,0.12),transparent_35%)]"
    ></div>

    <div class="container mx-auto px-4 relative z-10">
      <div
        class="max-w-5xl mx-auto bg-card rounded-3xl border border-primary/70 shadow-[0_0_45px_rgba(78,221,97,0.3)] overflow-hidden"
      >
        <div class="flex flex-col md:flex-row">
          <!-- Event Info -->
          <div class="p-8 md:p-12 md:w-2/3 space-y-6">
            <div
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :visible="{ opacity: 1, scale: 1 }"
              class="inline-flex items-center gap-3 px-6 py-2 bg-red-500/10 border border-red-500/40 rounded-full uppercase tracking-[0.3em] text-sm font-black text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              <div class="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              Selling Now
            </div>
            <h2
              class="text-4xl md:text-6xl font-black text-white uppercase leading-none tracking-tighter"
            >
              {{ title }} <span class="text-primary block md:inline md:ml-4 drop-shadow-[0_0_20px_rgba(78,221,97,0.4)]">Up Next</span>
            </h2>
            <div
              class="flex flex-wrap gap-8 text-gray-200 font-mono text-base font-bold"
            >
              <div class="flex items-center gap-2 group">
                <Clock class="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
                <span>DOORS: —</span>
              </div>
              <div class="flex items-center gap-2 group">
                <Play class="w-6 h-6 text-primary group-hover:scale-125 transition-transform" />
                <span>START: {{ next?.startTime ?? "—" }}</span>
              </div>
            </div>
            <p class="text-gray-300 text-xl leading-relaxed font-medium">
              Doors open early. High-stakes patterns and jackpots
              that deliver. First come, first served.
            </p>
            <NuxtLink
              :to="ctaLink"
              class="bg-white text-black hover:bg-primary hover:text-black font-black py-5 px-12 rounded-2xl transition-all duration-300 uppercase tracking-[0.2em] inline-flex items-center gap-3 group shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95"
            >
              View Program
              <ArrowRight
                class="w-6 h-6 group-hover:translate-x-2 transition-transform"
              />
            </NuxtLink>
          </div>

          <!-- Countdown Timer -->
          <div
            class="bg-[#0e0e0e] p-8 md:p-12 md:w-1/3 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-primary/30"
          >
            <div
              class="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-6"
            >
              Time Until First Ball
            </div>
            <div class="grid grid-cols-3 gap-3 w-full">
              <div class="flex flex-col">
                <span
                  class="text-4xl md:text-5xl font-black text-white font-mono bg-charcoal rounded-lg py-3 shadow-inner shadow-black/40"
                  >{{ pad(countdown.hours) }}</span
                >
                <span class="text-[10px] text-gray-500 mt-2 uppercase"
                  >Hrs</span
                >
              </div>
              <div class="flex flex-col">
                <span
                  class="text-4xl md:text-5xl font-black text-white font-mono bg-charcoal rounded-lg py-3 shadow-inner shadow-black/40"
                  >{{ pad(countdown.minutes) }}</span
                >
                <span class="text-[10px] text-gray-500 mt-2 uppercase"
                  >Mins</span
                >
              </div>
              <div class="flex flex-col">
                <span
                  class="text-4xl md:text-5xl font-black text-white font-mono bg-charcoal rounded-lg py-3 shadow-inner shadow-black/40"
                  >{{ pad(countdown.seconds) }}</span
                >
                <span class="text-[10px] text-gray-500 mt-2 uppercase"
                  >Secs</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="mt-6 text-red-400 text-sm">{{ error }}</div>
    </div>
  </section>
</template>
