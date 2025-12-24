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

          <!-- Session Card -->
          <div
            class="relative bg-white border-2 border-slate-200 rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl hover:border-gold-300 hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
          >
            <!-- Background Gradient on Hover -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-gold-50/0 to-gold-100/0 group-hover:from-gold-50/50 group-hover:to-gold-100/30 transition-all duration-500 rounded-3xl"
            ></div>

            <div
              class="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center"
            >
              <!-- Icon Circle -->
              <div
                class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-900 to-primary-700 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
              >
                <Clock
                  class="w-8 h-8 md:w-10 md:h-10 text-gold-300"
                  :stroke-width="2.5"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 space-y-3">
                <div class="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h3
                      class="text-2xl md:text-3xl font-black text-primary-900 mb-2 group-hover:text-primary-700 transition-colors"
                    >
                      {{ session.name }}
                    </h3>
                    <div
                      class="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full text-primary-900 font-bold"
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
                      <span class="text-base">{{ session.time }}</span>
                    </div>
                  </div>

                  <!-- Session Number Badge -->
                  <div
                    class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg"
                  >
                    {{ idx + 1 }}
                  </div>
                </div>

                <p class="text-lg text-slate-700 leading-relaxed">
                  {{ session.details }}
                </p>

                <!-- Quick Action Tags -->
                <div class="flex flex-wrap gap-2 pt-2">
                  <span
                    v-if="idx === 0"
                    class="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    Opens First
                  </span>
                  <span
                    v-if="idx === Math.floor(sessions.length / 2)"
                    class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    ⭐ Peak Hours
                  </span>
                  <span
                    v-if="idx === sessions.length - 1"
                    class="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    🌙 Night Owl Friendly
                  </span>
                </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Clock } from "lucide-vue-next";
import BaseButton from "~/components/ui/BaseButton.vue";
import DailySpecials from "~/components/DailySpecials.vue";
import { BUSINESS_INFO } from "~/utils/business";

useSeoMeta({
  title: "Schedule | Mary Esther Bingo",
  description: `View our general schedule at ${BUSINESS_INFO.name}. Sessions are offered daily.`,
});

const { data: sessions } = await useFetch("/api/schedule");
</script>
