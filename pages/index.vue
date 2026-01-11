<template>
  <div class="bg-richBlack text-white font-sans overflow-x-hidden">
    <!-- 1. HERO SECTION -->
    <section
      class="relative h-screen min-h-[650px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-black/50 via-richBlack/50 to-richBlack"
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
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-man-with-neon-lights-1282-large.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <!-- Ticker -->
      <div
        class="absolute top-0 left-0 w-full bg-black/80 z-30 py-2 overflow-hidden border-b border-primary/20"
      >
        <div class="ticker-wrap">
          <div class="ticker">
            <div
              class="ticker-item text-primary font-bold tracking-[0.25em] uppercase text-xs md:text-sm"
            >
              TOTAL PAYOUTS: $4.2M • LAST WINNER: $10K • PROGRESSIVE JACKPOT IS
              LIVE • NEXT DRAW IN MINUTES
            </div>
            <div
              class="ticker-item text-primary font-bold tracking-[0.25em] uppercase text-xs md:text-sm"
            >
              • TOTAL PAYOUTS: $4.2M • LAST WINNER: $10K • PROGRESSIVE JACKPOT
              IS LIVE • NEXT DRAW IN MINUTES
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-20 container mx-auto px-4 text-center mt-16">
        <h1
          v-motion-fade-visible-once
          class="text-6xl md:text-[7rem] lg:text-[10rem] font-black uppercase tracking-tighter mb-8 leading-[0.85] text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          <span class="block">Florida’s</span>
          <span class="block text-primary drop-shadow-[0_0_30px_rgba(78,221,97,0.6)]">High-Stakes</span>
          <span class="block text-white">Legend</span>
        </h1>
        <p
          v-motion-fade-visible-once
          class="text-xl md:text-3xl text-gray-200 max-w-4xl mx-auto mb-14 font-black uppercase tracking-widest bg-black/40 backdrop-blur-md py-4 rounded-2xl border border-white/5"
        >
          Millions awarded monthly. Winning energy. <span class="text-primary italic">Absolute thrill.</span>
        </p>
        <div
          v-motion-slide-visible-once-bottom
          class="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <NuxtLink
            to="/schedule"
            class="group relative bg-primary hover:bg-white text-black text-xl font-black py-5 px-14 rounded-full transition-all duration-300 transform hover:scale-110 shadow-[0_20px_60px_rgba(78,221,97,0.5)] uppercase tracking-[0.2em] overflow-hidden"
          >
            <span class="relative z-10">Plan Your Visit</span>
            <div class="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
          </NuxtLink>
          <NuxtLink
            to="/pricing"
            class="bg-transparent border-4 border-primary hover:bg-primary/20 text-primary text-xl font-black py-5 px-14 rounded-full transition-all uppercase tracking-[0.2em] backdrop-blur-md shadow-[0_0_30px_rgba(78,221,97,0.2)]"
          >
            Session Packs
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 2. THE NUMBERS (Stat Bar) -->
    <section class="bg-primary py-16 relative z-30 -mt-2 shadow-[0_0_50px_rgba(78,221,97,0.4)]">
      <div class="container mx-auto px-4">
        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
        >
          <div v-motion-pop-visible-once class="space-y-2">
            <div class="text-5xl md:text-7xl font-black text-richBlack mb-1 tracking-tighter">
              $25K+
            </div>
            <div class="text-richBlack/70 font-black uppercase tracking-[0.3em] text-xs">
              DAILY PAYOUTS
            </div>
          </div>
          <div v-motion-pop-visible-once class="space-y-2 border-y md:border-y-0 md:border-x border-richBlack/10 py-8 md:py-0">
            <div class="text-5xl md:text-7xl font-black text-richBlack mb-1 tracking-tighter">
              $10,000,000+
            </div>
            <div class="text-richBlack/70 font-black uppercase tracking-[0.3em] text-xs">
              ANNUAL PAYOUTS
            </div>
          </div>
          <div v-motion-pop-visible-once class="space-y-2">
            <div class="text-5xl md:text-7xl font-black text-richBlack mb-1 tracking-tighter">
              Every Day
            </div>
            <div class="text-richBlack/70 font-black uppercase tracking-[0.3em] text-xs">
              OPEN 7 DAYS A WEEK
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. UP NEXT (Countdown) -->
    <UpNext />

    <!-- 4. FEATURE GRID -->
    <section class="py-24 bg-richBlack text-white">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <!-- Card 1 -->
          <div
            v-motion-slide-visible-once-bottom
            class="bg-charcoal p-10 rounded-[2.5rem] border border-zinc-800/70 hover:border-primary/70 transition-all duration-500 group shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:translate-y-[-10px]"
          >
            <div
              class="w-20 h-20 bg-[#0f0f0f] rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-all duration-500 text-primary shadow-inner"
            >
              <Monitor class="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-3xl font-black mb-4 uppercase tracking-tighter leading-none text-white">
              Electronic <span class="text-primary block">Power</span>
            </h3>
            <p class="text-gray-400 text-lg leading-relaxed font-medium">
              Play dozens of cards at once with precision terminals 
              that track every win automatically. Maximize your edge.
            </p>
          </div>

          <!-- Card 2 -->
          <div
            v-motion-slide-visible-once-bottom
            class="bg-charcoal p-10 rounded-[2.5rem] border border-zinc-800/70 hover:border-primary/70 transition-all duration-500 group shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:translate-y-[-10px]"
          >
            <div
              class="w-20 h-20 bg-[#0f0f0f] rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-all duration-500 text-primary shadow-inner"
            >
              <Armchair class="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-3xl font-black mb-4 uppercase tracking-tighter leading-none text-white">
              Luxe <span class="text-primary block">Comfort</span>
            </h3>
            <p class="text-gray-400 text-lg leading-relaxed font-medium">
              Premium seating, climate control, and tableside 
              service. Experience bingo in a state-of-the-art lounge.
            </p>
          </div>

          <!-- Card 3 -->
          <div
            v-motion-slide-visible-once-bottom
            class="bg-charcoal p-10 rounded-[2.5rem] border border-zinc-800/70 hover:border-primary/70 transition-all duration-500 group shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:translate-y-[-10px]"
          >
            <div
              class="w-20 h-20 bg-[#0f0f0f] rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-all duration-500 text-primary shadow-inner"
            >
              <DollarSign class="w-10 h-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 class="text-3xl font-black mb-4 uppercase tracking-tighter leading-none text-white">
              Daily <span class="text-primary block">Jackpots</span>
            </h3>
            <p class="text-gray-400 text-lg leading-relaxed font-medium">
              Massive daily payouts and progressive totals 
              that climb every session. This is where legends are made.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. SOCIAL PROOF (Winner's Circle) -->
    <section class="py-32 bg-[#050505] overflow-hidden">
      <div class="container mx-auto px-4 md:px-8">
        <div class="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div class="max-w-3xl">
            <h2 v-motion-slide-visible-once-left class="text-6xl md:text-9xl font-black uppercase mb-6 tracking-tighter text-white leading-[0.85]">
              Real Players<span class="text-primary">.</span><br />
              Real <span class="italic text-primary text-[1.1em]">Cash.</span>
            </h2>
            <p v-motion-slide-visible-once-left :delay="200" class="text-zinc-500 text-xl md:text-2xl font-medium tracking-tight">
              Join the thousands who win big every week at Mary Esther Bingo. 
              Your seat is waiting in the winner's circle.
            </p>
          </div>
          <div v-motion-pop-visible-once class="bg-primary px-8 py-4 rounded-full text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform cursor-default shadow-[0_0_30px_rgba(78,221,97,0.4)]">
            Every Night is Jackpot Night
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Winner 1 -->
          <div v-motion-slide-visible-once-bottom class="relative group aspect-[4/5] overflow-hidden rounded-[3rem] border border-zinc-900 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80"
              alt="Recent Winner"
              class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
            <div class="absolute bottom-10 left-10 p-2">
              <div class="text-primary text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">Winner Spotlight</div>
              <div class="text-white text-4xl font-black uppercase tracking-tighter">Big Win<br/><span class="text-primary">$2,500+</span></div>
            </div>
          </div>
          <!-- Winner 2 -->
          <div v-motion-slide-visible-once-bottom :delay="100" class="relative group aspect-[4/5] overflow-hidden rounded-[3rem] border border-zinc-900 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=800&q=80"
              alt="Recent Winner"
              class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
            <div class="absolute bottom-10 left-10 p-2">
              <div class="text-primary text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">Tonight's Payout</div>
              <div class="text-white text-4xl font-black uppercase tracking-tighter">Jackpot<br/><span class="text-primary">Verified</span></div>
            </div>
          </div>
          <!-- Winner 3 -->
          <div v-motion-slide-visible-once-bottom :delay="200" class="relative group aspect-[4/5] overflow-hidden rounded-[3rem] border border-zinc-900 shadow-2xl lg:translate-y-12">
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
              alt="Recent Winner"
              class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
            <div class="absolute bottom-10 left-10 p-2">
              <div class="text-primary text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">Daily Legends</div>
              <div class="text-white text-4xl font-black uppercase tracking-tighter">Local<br/><span class="text-primary">Celebrity</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. MISSION SECTION -->
    <section class="py-48 bg-richBlack text-white text-center relative overflow-hidden">
      <!-- Background Flair -->
      <div class="absolute inset-0 opacity-20 pointer-events-none">
        <div class="absolute top-[-50%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(78,221,97,0.15),transparent_70%)]"></div>
      </div>

      <div class="container mx-auto px-4 max-w-5xl relative z-10">
        <div v-motion-pop-visible-once>
          <Heart class="w-24 h-24 mx-auto mb-12 text-primary drop-shadow-[0_0_40px_rgba(78,221,97,0.8)] animate-pulse" />
        </div>
        <h2 
          v-motion-fade-visible-once
          class="text-6xl md:text-[8rem] font-black uppercase mb-12 tracking-tighter text-white leading-none"
        >
          Play <span class="text-primary italic">With</span> Purpose
        </h2>
        <p class="text-2xl md:text-4xl text-zinc-400 leading-tight mb-20 font-bold tracking-tight">
          When you chase the thrill at Mary Esther Bingo, you chase it for something 
          bigger. We’ve turned high-stakes gaming into <span class="text-white border-b-4 border-primary">life-changing</span> local impact.
        </p>
        <div
          v-motion-slide-visible-once-bottom
          class="text-5xl md:text-8xl font-black font-serif italic text-primary tracking-tighter"
        >
          "Win Big. Do Good."
        </div>
      </div>
    </section>

    <footer class="bg-charcoal text-gray-300 py-20 text-center border-t border-zinc-900">
      <div class="container mx-auto px-4">
        <div class="text-primary text-xs font-black uppercase tracking-[0.5em] mb-6">Designed for Winners</div>
        <div class="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-10">Always Bet On <span class="text-primary italic">Green.</span></div>
        <p class="text-zinc-500 uppercase tracking-widest text-xs font-bold">
           &copy; {{ new Date().getFullYear() }} Mary Esther Bingo. High-Stakes Hospitality.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { Monitor, Armchair, DollarSign, Quote, Heart } from "lucide-vue-next";
import UpNext from "~/components/public/UpNext.vue";

// Countdown logic moved into UpNext component.

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
