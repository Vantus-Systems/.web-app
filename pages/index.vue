<template>
  <div class="bg-slate-900 text-white font-sans overflow-x-hidden">
    <!-- 1. HERO SECTION -->
    <section
      class="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      <!-- Video Background -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-black/60 z-10"></div>
        <video
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover"
        >
          <!-- Placeholder video URL -->
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-man-with-neon-lights-1282-large.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <!-- Ticker -->
      <div
        class="absolute top-0 left-0 w-full bg-black/80 z-30 py-2 overflow-hidden border-b border-white/10"
      >
        <div class="ticker-wrap">
          <div class="ticker">
            <div
              class="ticker-item text-primary font-bold tracking-wider uppercase text-sm md:text-base"
            >
              TOTAL PRIZES AWARDED LAST MONTH: $4,250,000+ • YESTERDAY’S TOP
              WINNER: $10,000 (SARAH M.) • CURRENT PROGRESSIVE: GROWING NOW
            </div>
            <!-- Duplicate for seamless loop -->
            <div
              class="ticker-item text-primary font-bold tracking-wider uppercase text-sm md:text-base"
            >
              • TOTAL PRIZES AWARDED LAST MONTH: $4,250,000+ • YESTERDAY’S TOP
              WINNER: $10,000 (SARAH M.) • CURRENT PROGRESSIVE: GROWING NOW
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-20 container mx-auto px-4 text-center mt-12">
        <h1
          class="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-6 leading-tight"
        >
          <span class="text-white">Florida's Premier</span><br />
          <span
            class="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400"
            >High-Stakes</span
          ><br />
          <span class="text-white">Bingo Destination</span>
        </h1>
        <p
          class="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 font-medium"
        >
          Experience the thrill of the region’s largest payouts. Millions
          awarded monthly in a state-of-the-art facility. Your winning moment is
          waiting.
        </p>
        <div
          class="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <NuxtLink
            to="/schedule"
            class="bg-primary hover:bg-green-600 text-white text-lg font-bold py-4 px-10 rounded-full transition-transform transform hover:scale-105 shadow-lg shadow-primary/30 uppercase tracking-widest"
          >
            Plan Your Visit
          </NuxtLink>
          <NuxtLink
            to="/pricing"
            class="bg-transparent border-2 border-white/30 hover:border-white hover:bg-white/10 text-white text-lg font-bold py-4 px-10 rounded-full transition-all uppercase tracking-widest backdrop-blur-sm"
          >
            View VIP Packages & Pricing
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 2. THE NUMBERS (Stat Bar) -->
    <section class="bg-primary py-12 relative z-20 -mt-2 shadow-2xl">
      <div class="container mx-auto px-4">
        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20"
        >
          <div class="py-4 md:py-0">
            <div class="text-4xl md:text-5xl font-black text-white mb-2">
              $25,000+
            </div>
            <div
              class="text-green-900 font-bold uppercase tracking-wider text-sm"
            >
              Tonight's Total Prize Pool (Est. Aggregate)
            </div>
          </div>
          <div class="py-4 md:py-0">
            <div class="text-4xl md:text-5xl font-black text-white mb-2">
              $5 MILLION
            </div>
            <div
              class="text-green-900 font-bold uppercase tracking-wider text-sm"
            >
              Awarded Year-To-Date
            </div>
          </div>
          <div class="py-4 md:py-0">
            <div class="text-4xl md:text-5xl font-black text-white mb-2">
              EVERY DAY
            </div>
            <div
              class="text-green-900 font-bold uppercase tracking-wider text-sm"
            >
              We Play 7 Days A Week
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. UP NEXT (Countdown) -->
    <section class="py-20 bg-zinc-900 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div
        class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-zinc-800/50 to-transparent pointer-events-none"
      ></div>

      <div class="container mx-auto px-4 relative z-10">
        <div
          class="max-w-4xl mx-auto bg-zinc-800 rounded-3xl border border-zinc-700 shadow-2xl overflow-hidden"
        >
          <div class="flex flex-col md:flex-row">
            <!-- Event Info -->
            <div class="p-8 md:p-12 md:w-2/3">
              <div class="flex items-center gap-2 mb-4">
                <span
                  class="animate-pulse w-3 h-3 bg-red-500 rounded-full"
                ></span>
                <span
                  class="text-red-500 font-bold uppercase tracking-widest text-sm"
                  >Selling Now</span
                >
              </div>
              <h2
                class="text-3xl md:text-4xl font-black text-white mb-4 uppercase leading-tight"
              >
                Up Next: The Evening Gala Session
              </h2>
              <div
                class="flex flex-wrap gap-6 mb-6 text-gray-400 font-mono text-sm"
              >
                <div class="flex items-center gap-2">
                  <Clock class="w-5 h-5 text-primary" />
                  <span>DOORS OPEN: 4:00 PM</span>
                </div>
                <div class="flex items-center gap-2">
                  <Play class="w-5 h-5 text-primary" />
                  <span>FIRST BALL: 7:30 PM</span>
                </div>
              </div>
              <p class="text-gray-300 mb-8 text-lg">
                Our signature nightly event. High-stakes patterns, progressive
                jackpots, and the massive 'Super 6' payout.
              </p>
              <button
                class="bg-white text-zinc-900 hover:bg-gray-200 font-bold py-3 px-8 rounded-xl transition-colors uppercase tracking-wider inline-flex items-center gap-2 group"
              >
                Reserve Your Seat
                <ArrowRight
                  class="w-5 h-5 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            <!-- Countdown Timer -->
            <div
              class="bg-zinc-950 p-8 md:p-12 md:w-1/3 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-zinc-700"
            >
              <div
                class="text-primary font-bold uppercase tracking-widest text-xs mb-6"
              >
                Time Until First Ball
              </div>
              <div class="grid grid-cols-3 gap-2 w-full">
                <div class="flex flex-col">
                  <span
                    class="text-3xl md:text-4xl font-black text-white font-mono bg-zinc-900 rounded-lg py-2"
                    >{{ pad(countdown.hours) }}</span
                  >
                  <span class="text-[10px] text-gray-500 mt-1 uppercase"
                    >Hrs</span
                  >
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-3xl md:text-4xl font-black text-white font-mono bg-zinc-900 rounded-lg py-2"
                    >{{ pad(countdown.minutes) }}</span
                  >
                  <span class="text-[10px] text-gray-500 mt-1 uppercase"
                    >Mins</span
                  >
                </div>
                <div class="flex flex-col">
                  <span
                    class="text-3xl md:text-4xl font-black text-white font-mono bg-zinc-900 rounded-lg py-2"
                    >{{ pad(countdown.seconds) }}</span
                  >
                  <span class="text-[10px] text-gray-500 mt-1 uppercase"
                    >Secs</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. FEATURE GRID -->
    <section class="py-24 bg-black text-white">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <!-- Card 1 -->
          <div
            class="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-primary/50 transition-colors group"
          >
            <div
              class="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary"
            >
              <Monitor class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4 uppercase">
              State-of-the-Art Electronic Gaming
            </h3>
            <p class="text-gray-400 leading-relaxed">
              Forget the daubers and maximize your odds. Our modern electronic
              terminals allow you to play dozens of cards simultaneously with
              automated tracking.
            </p>
          </div>

          <!-- Card 2 -->
          <div
            class="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-primary/50 transition-colors group"
          >
            <div
              class="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary"
            >
              <Armchair class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4 uppercase">
              First-Class Hospitality
            </h3>
            <p class="text-gray-400 leading-relaxed">
              Relax in our climate-controlled hall featuring premium seating,
              tableside service, and a secure environment.
            </p>
          </div>

          <!-- Card 3 -->
          <div
            class="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-primary/50 transition-colors group"
          >
            <div
              class="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary"
            >
              <DollarSign class="w-8 h-8" />
            </div>
            <h3 class="text-2xl font-bold mb-4 uppercase">
              Massive Daily Payouts
            </h3>
            <p class="text-gray-400 leading-relaxed">
              We don’t just play for fun—we play for keeps. With daily payouts
              exceeding the competition and verified winners taking home
              thousands every week.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. SOCIAL PROOF (Winner's Circle) -->
    <section class="py-24 bg-zinc-900 relative">
      <div class="container mx-auto px-4">
        <div class="flex flex-col lg:flex-row items-center gap-16">
          <div class="lg:w-1/2">
            <div
              class="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 uppercase tracking-widest border border-primary/20"
            >
              Verified Winners
            </div>
            <h2
              class="text-4xl md:text-5xl font-black text-white mb-6 uppercase leading-tight"
            >
              Welcome to the Winner's Circle
            </h2>
            <p class="text-xl text-gray-400 mb-8">
              Join the thousands of players who have turned a night out into a
              major payday.
            </p>

            <div
              class="bg-black/40 p-8 rounded-2xl border border-zinc-800 mb-8 relative"
            >
              <Quote
                class="absolute top-8 left-8 text-zinc-700 w-12 h-12 opacity-50"
              />
              <p
                class="text-lg md:text-xl text-white italic relative z-10 mb-6 pl-6"
              >
                "I never thought I'd hit the big one until I came to Mary
                Esther. The energy here is unlike anywhere else!"
              </p>
              <div class="flex items-center gap-4 pl-6">
                <div
                  class="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white"
                >
                  J
                </div>
                <div>
                  <div class="font-bold text-white">James T.</div>
                  <div class="text-primary text-sm font-bold">
                    $5,000 Winner
                  </div>
                </div>
              </div>
            </div>

            <button
              class="text-white font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
            >
              See Recent Winners <ArrowRight class="w-4 h-4" />
            </button>
          </div>

          <div class="lg:w-1/2 relative">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-4 translate-y-8">
                <div
                  class="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-800 shadow-xl border border-zinc-700/50"
                >
                  <!-- Placeholder -->
                  <div
                    class="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 font-bold"
                  >
                    Winner 1
                  </div>
                </div>
                <div
                  class="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-800 shadow-xl border border-zinc-700/50"
                >
                  <div
                    class="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 font-bold"
                  >
                    Winner 2
                  </div>
                </div>
              </div>
              <div class="space-y-4">
                <div
                  class="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-800 shadow-xl border border-zinc-700/50"
                >
                  <div
                    class="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 font-bold"
                  >
                    Winner 3
                  </div>
                </div>
                <div
                  class="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-800 shadow-xl border border-zinc-700/50"
                >
                  <div
                    class="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 font-bold"
                  >
                    Winner 4
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. MISSION SECTION -->
    <section class="py-20 bg-primary text-white text-center">
      <div class="container mx-auto px-4 max-w-4xl">
        <Heart class="w-12 h-12 mx-auto mb-6 text-white/90" />
        <h2 class="text-3xl md:text-5xl font-black uppercase mb-6">
          Play With Purpose
        </h2>
        <p class="text-xl md:text-2xl text-green-50 leading-relaxed mb-10">
          At Mary Esther Bingo, your entertainment drives our community. As a
          volunteer-supported organization, a portion of every dollar played
          goes directly to supporting local charities.
        </p>
        <div
          class="text-2xl md:text-4xl font-black font-serif italic text-white/90"
        >
          "Win Big. Do Good."
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  Monitor,
  Armchair,
  DollarSign,
  Clock,
  Play,
  ArrowRight,
  Quote,
  Heart,
} from "lucide-vue-next";

// Countdown Logic
const targetTime = new Date();
targetTime.setHours(19, 30, 0, 0); // 7:30 PM today

// If it's already past 7:30 PM, set target to tomorrow
if (new Date() > targetTime) {
  targetTime.setDate(targetTime.getDate() + 1);
}

const timeLeft = ref(targetTime.getTime() - new Date().getTime());

const countdown = computed(() => {
  const ms = timeLeft.value;
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
});

const pad = (num: number) => num.toString().padStart(2, "0");

let timerInterval: ReturnType<typeof setInterval>;

onMounted(() => {
  timerInterval = setInterval(() => {
    const now = new Date();
    // Reset target if passed
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    timeLeft.value = Math.max(0, targetTime.getTime() - now.getTime());
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

useSeoMeta({
  title: "Florida’s Premier High-Stakes Bingo Destination",
  description:
    "Experience the thrill of the region’s largest payouts. Millions awarded monthly in a state-of-the-art facility.",
});
</script>

<style scoped>
@keyframes ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.ticker-wrap {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.ticker {
  display: inline-block;
  animation: ticker 30s linear infinite;
}

.ticker-item {
  display: inline-block;
  padding: 0 2rem;
}
</style>
