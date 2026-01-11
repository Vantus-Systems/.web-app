<script setup lang="ts">
import {
  Calendar,
  Info,
  TrendingUp,
  Star,
  Zap,
  Moon,
  Sun,
  ChevronRight,
  ArrowRight
} from "lucide-vue-next";
import ProgramTable from "~/components/bingo/ProgramTable.vue";
import { formatHHMM } from "~/utils/time.utils";

interface Session {
  id: string;
  name: string;
  category: string;
  startTime: string;
  endTime: string;
  gameType: string;
  description: string;
  vibe: string[];
  pricing: {
    machines?: string;
    paper?: string;
    type: string;
    [key: string]: any;
  };
  jackpot: string;
  status: string;
  eligibility: string;
  availableDays: string[];
  games?: { number: number; name: string; detail?: string }[];
  bonuses?: Record<string, any>;
  specials?: Record<string, string>;
  programSlug?: string;
}

const props = defineProps<{
  session: Session;
  index: number;
  activeDayOfWeek?: string;
  program?: any;
  status?: "live" | "upcoming" | "past" | "inactive";
}>();

const currentSpecial = computed(() => {
  if (!props.session.specials || !props.activeDayOfWeek) return null;
  return (
    props.session.specials[props.activeDayOfWeek] ||
    props.session.specials[props.activeDayOfWeek.substring(0, 3)]
  );
});

const categoryStyles = {
  Morning: {
    gradient: "from-amber-500/20 via-orange-500/20 to-transparent",
    bg: "bg-charcoal",
    border: "border-amber-500/30",
    text: "text-amber-500",
    icon: Sun,
    accent: "bg-amber-500/10 text-amber-500",
  },
  Afternoon: {
    gradient: "from-blue-500/20 via-cyan-500/20 to-transparent",
    bg: "bg-charcoal",
    border: "border-blue-500/30",
    text: "text-blue-500",
    icon: Zap,
    accent: "bg-blue-500/10 text-blue-500",
  },
  Evening: {
    gradient: "from-primary/20 via-primary/10 to-transparent",
    bg: "bg-charcoal",
    border: "border-primary/30",
    text: "text-primary",
    icon: Star,
    accent: "bg-primary/10 text-primary",
  },
  "Late Night": {
    gradient: "from-purple-500/20 via-fuchsia-500/20 to-transparent",
    bg: "bg-charcoal",
    border: "border-purple-500/30",
    text: "text-purple-500",
    icon: Moon,
    accent: "bg-purple-500/10 text-purple-500",
  },
};

const style = computed(
  () =>
    categoryStyles[props.session.category as keyof typeof categoryStyles] ||
    categoryStyles.Evening,
);

const formatPricing = (pricing: any) => {
  if (typeof pricing === "string") return pricing;
  if (pricing.machines) return `Machines: ${pricing.machines}`;
  if (pricing.sessionBuyIn)
    return `Buy-in: ${pricing.sessionBuyIn.twoMachines}`;
  return "See pricing page for details";
};

const addToCalendar = () => {
  let targetDate = new Date();
  if (props.activeDayOfWeek) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const targetDayIndex = days.indexOf(props.activeDayOfWeek);
    if (targetDayIndex !== -1) {
      const currentDayIndex = targetDate.getDay();
      let daysUntil = (targetDayIndex - currentDayIndex + 7) % 7;
      targetDate.setDate(targetDate.getDate() + daysUntil);
    }
  }
  const dateStr = targetDate.toISOString().split("T")[0];
  const url = `/api/calendar/ics?sessionId=${props.session.id}&date=${dateStr}`;
  window.location.href = url;
};

const startTimeParts = computed(() => {
  const formatted = formatHHMM(props.session.startTime);
  const [time, period] = formatted.split(" ");
  return { time, period: period ?? "" };
});
</script>

<template>
  <div
    class="group relative bg-charcoal border-2 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:scale-[1.01]"
    :class="[status === 'live' ? 'border-primary ring-4 ring-primary/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)]' : 'border-zinc-900']"
  >
    <!-- Background Texture -->
    <div class="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-br transition-opacity duration-700 opacity-20" :class="[style.gradient]"></div>
    </div>

    <div class="flex flex-col lg:flex-row relative z-10">
      <!-- Time & Category Sidebar -->
      <div
        class="lg:w-72 flex flex-col items-center justify-center p-12 text-white relative overflow-hidden shrink-0"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm border-r border-zinc-900"></div>

        <div class="relative z-10 text-center">
          <div
            v-if="status === 'live'"
            class="mb-6 flex items-center justify-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full animate-pulse"
          >
            <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
            <span class="text-[10px] font-black uppercase tracking-widest text-primary">Live Now</span>
          </div>

          <div class="text-7xl font-black tracking-tighter leading-none mb-2">
            {{ startTimeParts.time }}
          </div>
          <div class="text-xs font-black text-primary uppercase tracking-[0.4em] mb-6">
            {{ startTimeParts.period }}
          </div>
          
          <div class="h-px w-10 bg-zinc-800 mx-auto mb-6"></div>
          
          <div class="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-black border border-zinc-800">
             <component :is="style.icon" class="w-4 h-4" :class="[style.text]" />
             <span class="text-[10px] font-black uppercase tracking-widest text-zinc-400">
               {{ session.category }}
             </span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-10 lg:p-16 flex flex-col justify-between">
        <div>
          <div class="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in session.vibe"
                :key="tag"
                class="text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl bg-black/50 border border-zinc-800 text-zinc-500 hover:text-white transition-colors"
                :class="[style.text]"
              >
                {{ tag }}
              </span>
            </div>

            <div v-if="session.status" class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(78,221,97,0.8)]"></div>
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white">Verified Schedule</span>
            </div>
          </div>

          <h3
            class="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter uppercase leading-none group-hover:text-primary transition-colors"
          >
            {{ session.name }}
          </h3>

          <p class="text-zinc-400 text-xl leading-relaxed mb-10 font-bold max-w-2xl">
            {{ session.description }}
          </p>

          <!-- Daily Special Highlight -->
          <div
            v-if="currentSpecial"
            class="mb-10 p-8 rounded-[2rem] border-2 border-primary shadow-[0_20px_40px_rgba(78,221,97,0.1)] flex items-start gap-6 transition-all duration-700 bg-black/40 group/special overflow-hidden relative"
          >
            <div class="absolute inset-0 bg-primary opacity-5 group-hover/special:opacity-10 transition-opacity"></div>
            <div
              class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg text-black"
            >
              <Star class="w-7 h-7" />
            </div>
            <div>
              <div
                class="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2"
              >
                Synchronized Daily Special
              </div>
              <div class="text-white font-black text-2xl uppercase tracking-tighter leading-tight">
                {{ currentSpecial }}
              </div>
            </div>
          </div>

          <!-- Session Details Grid -->
          <div class="grid md:grid-cols-2 gap-8 mb-12">
            <div class="space-y-6">
              <div class="p-6 rounded-3xl bg-black border border-zinc-900 group/feature">
                <div class="flex items-center gap-4 mb-4">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-primary/10 group-hover/feature:bg-primary group-hover/feature:text-black transition-all"
                  >
                    <TrendingUp class="w-5 h-5" />
                  </div>
                  <div
                    class="text-[10px] font-black uppercase tracking-widest text-zinc-500"
                  >
                    Peak Live Jackpot
                  </div>
                </div>
                <div class="text-3xl font-black text-white tabular-nums tracking-widest">
                  {{ session.jackpot }}
                </div>
              </div>

              <div class="p-6 rounded-3xl bg-black border border-zinc-900 group/feature">
                <div class="flex items-center gap-4 mb-4">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-primary/10 group-hover/feature:bg-primary group-hover/feature:text-black transition-all"
                  >
                    <Info class="w-5 h-5" />
                  </div>
                  <div
                    class="text-[10px] font-black uppercase tracking-widest text-zinc-500"
                  >
                    Game Tier / Intake
                  </div>
                </div>
                <div class="text-2xl font-black text-white uppercase tracking-tighter">
                  {{ formatPricing(session.pricing) }}
                </div>
              </div>

              <!-- Sunday Bonuses -->
              <div v-if="session.bonuses" class="pt-2 space-y-4">
                <div
                  v-if="session.bonuses.freeDinner"
                  class="flex items-center gap-4 text-primary font-black uppercase text-[10px] tracking-[0.2em] bg-primary/5 p-4 rounded-2xl border border-primary/10"
                >
                  <div class="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(78,221,97,1)]"></div>
                  Complimentary Operational Rations Included
                </div>
                <div
                  v-if="session.bonuses.multipleJackpots"
                  class="flex items-center gap-4 text-white font-black uppercase text-[10px] tracking-[0.2em] bg-white/5 p-4 rounded-2xl border border-white/10"
                >
                  <div class="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]"></div>
                  {{ session.bonuses.multipleJackpots }}
                </div>
              </div>
            </div>

            <!-- Program Table or Legacy Game Stack -->
            <div
              v-if="program"
              class="md:col-span-1 bg-black/50 rounded-[2rem] p-8 border border-zinc-900 group/table overflow-hidden relative"
            >
              <div class="absolute inset-0 bg-primary opacity-0 group-hover/table:opacity-[0.02] transition-opacity duration-1000"></div>
              <div
                class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6"
              >
                Operational Program
              </div>
              <ProgramTable :program="program" condensed />
            </div>
            <div
              v-else-if="session.games"
              class="bg-black/50 rounded-[2rem] p-8 border border-zinc-900"
            >
              <div
                class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6"
              >
                Featured Game List
              </div>
              <div class="space-y-4">
                <div
                  v-for="game in session.games.slice(0, 4)"
                  :key="game.number"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="font-bold text-zinc-300 uppercase tracking-widest"
                    >{{ game.number }}. {{ game.name }}</span
>
                  <span v-if="game.detail" class="text-[10px] font-black text-primary uppercase tracking-widest">{{
                    game.detail
                  }}</span>
                </div>
                <div
                  v-if="session.games.length > 4"
                  class="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] pt-4 border-t border-zinc-900"
                >
                  + {{ session.games.length - 4 }} System Modules
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div
          class="pt-10 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-8"
        >
          <div class="flex items-center gap-8">
            <button
              class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 font-black text-[10px] uppercase tracking-[0.3em] transition-all"
              @click="addToCalendar"
            >
              <Calendar class="w-5 h-5" />
              Sync to Deck
            </button>
            <NuxtLink
              v-if="session.programSlug"
              :to="`/programs#${session.programSlug}`"
              class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 font-black text-[10px] uppercase tracking-[0.3em] transition-all"
            >
              Analysis
              <ChevronRight class="w-5 h-5" />
            </NuxtLink>
          </div>

          <NuxtLink
              to="/pricing"
              class="w-full sm:w-auto px-10 py-5 rounded-full bg-primary text-black font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-[0_20px_40px_rgba(78,221,97,0.2)] flex items-center justify-center gap-3 group/link"
            >
              Acquire Entry <ArrowRight class="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
            </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
