<template>
  <div class="bg-slate-50 min-h-screen">
    <!-- Daily Specials Full-Width Hero -->
    <DailySpecials />

    <div class="container mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-6xl font-black text-primary-900 mb-4">
          Daily Schedule
        </h1>
        <p class="text-slate-600 max-w-2xl mx-auto text-xl font-light">
          Every session is an opportunity for excitement, community, and
          winning.
        </p>
      </div>

      <!-- Timeline-Style Session Cards -->
      <div class="max-w-5xl mx-auto space-y-6">
        <div
          v-for="(session, idx) in sessions"
          :key="session.name"
          v-motion-fade-visible
          class="group relative"
        >
          <!-- Timeline Line (desktop) -->
          <div
            v-if="idx < sessions.length - 1"
            class="hidden md:block absolute left-8 top-24 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 to-gold-200 opacity-30"
          ></div>

          <!-- Session Card (Premium) -->
          <div
            class="relative bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <!-- Pricing chip (top-right) -->
            <div class="absolute -top-3 -right-3 z-10">
              <div
                v-if="session.pricing"
                class="inline-flex items-center gap-2 bg-gradient-to-br from-gold-500 to-gold-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-black"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 1v22" />
                  <path d="M17 5H9a4 4 0 1 0 0 8h8a4 4 0 1 1 0 8H7" />
                </svg>
                <span class="text-xs opacity-80">From</span>
                <span class="text-sm">{{ session.pricing }}</span>
              </div>
            </div>

            <!-- Decorative background -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-gold-50/0 to-gold-100/0 group-hover:from-gold-50/40 group-hover:to-gold-100/20 rounded-3xl transition-all duration-500"
            ></div>

            <div class="relative z-10 grid md:grid-cols-6 gap-6 items-center">
              <div class="md:col-span-1 flex items-center">
                <div
                  class="w-16 h-16 rounded-full bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-105"
                >
                  <Clock class="w-8 h-8 text-gold-300" :stroke-width="2.5" />
                </div>
              </div>

              <div class="md:col-span-4">
                <h3
                  class="text-2xl md:text-3xl font-black text-primary-900 mb-2"
                >
                  {{ session.name }}
                </h3>

                <div class="flex items-center gap-3 flex-wrap">
                  <div
                    class="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full text-primary-900 font-bold text-sm"
                  >
                    <svg
                      class="w-4 h-4 text-gold-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span class="text-sm">{{ session.time }}</span>
                  </div>

                  <span
                    v-if="idx === 0"
                    class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Opens First
                  </span>

                  <span
                    v-if="idx === Math.floor(sessions.length / 2)"
                    class="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    ⭐ Peak Hours
                  </span>

                  <span
                    v-if="idx === sessions.length - 1"
                    class="inline-flex items-center gap-1 bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    🌙 Night Owl Friendly
                  </span>
                </div>

                <p class="text-slate-700 mt-3 leading-relaxed">
                  {{ session.details }}
                </p>
              </div>

              <div
                class="md:col-span-1 flex md:flex-col items-center justify-end gap-4"
              >
                <div
                  class="hidden md:flex w-14 h-14 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center font-black shadow-lg text-lg"
                >
                  {{ idx + 1 }}
                </div>

                <NuxtLink to="/pricing" class="block">
                  <BaseButton variant="outline" class="text-sm px-4 py-2"
                    >View Pricing</BaseButton
                  >
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer CTA Card -->
      <div
        class="max-w-5xl mx-auto mt-16 bg-gradient-to-br from-primary-900 to-primary-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596706062103-3a7b95399c71?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5"
        ></div>
        <div class="relative z-10">
          <h3 class="text-3xl md:text-4xl font-black mb-4">
            Ready to Join the Fun?
          </h3>
          <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Times and features may vary. Closing time depends on daily
            activities. Contact us for the most current information.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/pricing">
              <BaseButton
                variant="gold"
                class="gap-2 shadow-xl shadow-gold/30 text-lg px-8 py-4"
              >
                <Download class="w-5 h-5" />
                View Pricing & Bundles
              </BaseButton>
            </NuxtLink>
            <NuxtLink to="/contact">
              <BaseButton
                variant="outline"
                class="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4"
              >
                Get Directions
              </BaseButton>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Fine print -->
      <p
        class="text-center text-sm text-slate-500 italic mt-6 max-w-3xl mx-auto"
      >
        *Family-friendly — 18+. Valid photo ID may be required for entry and
        prize claims.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Clock } from "lucide-vue-next";
import { computed } from "vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import DailySpecials from "~/components/DailySpecials.vue";
import { BUSINESS_INFO } from "~/utils/business";

interface Session {
  name: string;
  time: string;
  details: string;
  pricing?: string;
}

useSeoMeta({
  title: "Schedule | Mary Esther Bingo",
  description: `View our general schedule at ${BUSINESS_INFO.name}. Sessions are offered daily.`,
});

const { data: sessionsData } = await useFetch<Session[]>("/api/schedule");

const sessions = computed(() => sessionsData.value || []);
</script>
