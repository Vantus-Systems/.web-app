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
} from "lucide-vue-next";
import ProgramTable from "~/components/bingo/ProgramTable.vue";

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
    gradient: "from-orange-500 via-amber-500 to-orange-600",
    bg: "bg-orange-50/50",
    border: "border-orange-100",
    text: "text-orange-600",
    icon: Sun,
    accent: "bg-orange-100 text-orange-700",
  },
  Afternoon: {
    gradient: "from-blue-500 via-indigo-500 to-blue-600",
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    text: "text-blue-600",
    icon: Zap,
    accent: "bg-blue-100 text-blue-700",
  },
  Evening: {
    gradient: "from-purple-600 via-fuchsia-600 to-purple-700",
    bg: "bg-purple-50/50",
    border: "border-purple-100",
    text: "text-purple-600",
    icon: Star,
    accent: "bg-purple-100 text-purple-700",
  },
  "Late Night": {
    gradient: "from-slate-800 via-slate-900 to-black",
    bg: "bg-slate-50/50",
    border: "border-slate-200",
    text: "text-slate-800",
    icon: Moon,
    accent: "bg-slate-200 text-slate-800",
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
  const text = encodeURIComponent(`Bingo: ${props.session.name}`);
  const details = encodeURIComponent(props.session.description);
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`;
  window.open(url, "_blank");
};
</script>

<template>
  <div
    class="group relative bg-white border rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2"
    :class="[style.border]"
  >
    <!-- Category Glow -->
    <div
      class="absolute -inset-2 opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-3xl"
      :class="[style.gradient.replace('from-', 'bg-')]"
    ></div>

    <div class="flex flex-col lg:flex-row relative z-10">
      <!-- Time & Category Sidebar -->
      <div
        :class="[
          style.gradient,
          'lg:w-64 flex flex-col items-center justify-center p-10 text-white bg-gradient-to-br relative overflow-hidden',
        ]"
      >
        <div
          class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
        ></div>

        <component :is="style.icon" class="w-8 h-8 mb-4 opacity-80" />

        <div class="text-center">
          <div class="text-4xl font-black tracking-tighter mb-1">
            {{ session.startTime.split(" ")[0] }}
          </div>
          <div class="text-sm font-black opacity-80 uppercase tracking-[0.2em]">
            {{ session.startTime.split(" ")[1] }}
          </div>
          <div class="mt-4 h-px w-8 bg-white/30 mx-auto"></div>
          <div class="mt-4 text-[10px] font-black uppercase tracking-[0.3em]">
            {{ session.category }}
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-8 lg:p-12 flex flex-col justify-between bg-white">
        <div>
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in session.vibe"
                :key="tag"
                class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors"
                :class="[style.accent, style.border]"
              >
                {{ tag }}
              </span>
            </div>

            <div
              v-if="status === 'live'"
              class="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100"
            >
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-green-500"
                ></span>
              </span>
              <span
                class="text-[10px] font-black uppercase tracking-widest text-green-700"
                >Live Now</span
              >
            </div>
          </div>

          <h3
            class="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-primary-600 transition-colors"
          >
            {{ session.name }}
          </h3>

          <p class="text-slate-500 text-lg leading-relaxed mb-8 font-medium">
            {{ session.description }}
          </p>

          <!-- Daily Special Highlight -->
          <div
            v-if="currentSpecial"
            class="mb-8 p-6 rounded-2xl border-2 border-dashed flex items-start gap-4 transition-all duration-300 group-hover:border-solid"
            :class="[style.bg, style.border]"
          >
            <div
              class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0"
            >
              <Star class="w-6 h-6 text-gold-500 animate-pulse" />
            </div>
            <div>
              <div
                class="text-[10px] font-black uppercase tracking-[0.2em] text-gold-600 mb-1"
              >
                Today's Special Promotion
              </div>
              <div class="text-slate-900 font-black text-lg leading-tight">
                {{ currentSpecial }}
              </div>
            </div>
          </div>

          <!-- Session Details Grid -->
          <div class="grid md:grid-cols-2 gap-8 mb-10">
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  :class="[style.bg]"
                >
                  <TrendingUp class="w-5 h-5" :class="[style.text]" />
                </div>
                <div>
                  <div
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Estimated Jackpot
                  </div>
                  <div class="text-lg font-black text-slate-900">
                    {{ session.jackpot }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  :class="[style.bg]"
                >
                  <Info class="w-5 h-5" :class="[style.text]" />
                </div>
                <div>
                  <div
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    Pricing Model
                  </div>
                  <div class="text-lg font-black text-slate-900">
                    {{ formatPricing(session.pricing) }}
                  </div>
                </div>
              </div>

              <!-- Sunday Bonuses -->
              <div v-if="session.bonuses" class="pt-4 space-y-3">
                <div
                  v-if="session.bonuses.freeDinner"
                  class="flex items-center gap-2 text-emerald-600 font-bold text-sm"
                >
                  <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Complimentary Dinner Included
                </div>
                <div
                  v-if="session.bonuses.multipleJackpots"
                  class="flex items-center gap-2 text-gold-600 font-bold text-sm"
                >
                  <div class="w-2 h-2 rounded-full bg-gold-500"></div>
                  {{ session.bonuses.multipleJackpots }}
                </div>
              </div>
            </div>

            <!-- Program Table or Legacy Game Stack -->
            <div
              v-if="program"
              class="md:col-span-2 bg-slate-50 rounded-2xl p-4 border border-slate-100"
            >
              <div
                class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4"
              >
                Full Program
              </div>
              <ProgramTable :program="program" />
            </div>
            <div
              v-else-if="session.games"
              class="bg-slate-50 rounded-2xl p-6 border border-slate-100"
            >
              <div
                class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4"
              >
                Featured Game Stack
              </div>
              <div class="space-y-2">
                <div
                  v-for="game in session.games.slice(0, 3)"
                  :key="game.number"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="font-bold text-slate-700"
                    >{{ game.number }}. {{ game.name }}</span
                  >
                  <span v-if="game.detail" class="text-xs text-slate-400">{{
                    game.detail
                  }}</span>
                </div>
                <div
                  v-if="session.games.length > 3"
                  class="text-[10px] font-black text-primary-600 uppercase tracking-widest pt-2"
                >
                  + {{ session.games.length - 3 }} More Games
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div
          class="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6"
        >
          <div class="flex items-center gap-4">
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-500 font-bold text-sm transition-all"
              @click="addToCalendar"
            >
              <Calendar class="w-4 h-4" />
              Add to Calendar
            </button>
          </div>

          <div class="flex items-center gap-4">
            <NuxtLink
              to="/contact"
              class="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-primary-900 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 group/btn"
            >
              Contact Us
              <ChevronRight
                class="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
