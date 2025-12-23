<template>
  <div class="bg-slate-50 min-h-screen py-20">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl text-primary-900 mb-4">
          Daily Schedule
        </h1>
        <p class="text-slate-600 max-w-2xl mx-auto text-lg">
          Sessions are scheduled throughout the day.
        </p>
      </div>

      <div
        class="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
      >
        <!-- Header Banner -->
        <div
          class="bg-primary-900 p-8 text-center border-b-4 border-gold relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596706062103-3a7b95399c71?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center"
          ></div>
          <div class="relative z-10">
            <h2
              class="text-2xl md:text-3xl font-heading font-bold text-white mb-2"
            >
              Doors Typically Open 10:00 AM
            </h2>
            <p class="text-gold font-medium tracking-wide uppercase text-sm">
              Seven Days A Week
            </p>
          </div>
        </div>

        <!-- Schedule Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-primary-50 text-primary-900">
                <th
                  class="p-6 font-heading font-bold text-lg border-b border-primary-100"
                >
                  Session Info
                </th>
                <th
                  class="p-6 font-heading font-bold text-lg border-b border-primary-100"
                >
                  Typical Start
                </th>
                <th
                  class="p-6 font-heading font-bold text-lg border-b border-primary-100 hidden md:table-cell"
                >
                  General Details
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="session in sessions"
                :key="session.name"
                class="hover:bg-gold/5 transition-colors group"
              >
                <td class="p-6">
                  <span
                    class="font-bold text-primary-900 text-xl block group-hover:text-primary-700 transition-colors"
                    >{{ session.name }}</span
                  >
                  <span class="md:hidden text-sm text-slate-500 mt-1 block">{{
                    session.details
                  }}</span>
                </td>
                <td
                  class="p-6 text-primary-800 text-lg font-mono font-medium whitespace-nowrap"
                >
                  <div class="flex items-center gap-2">
                    <Clock class="w-4 h-4 text-gold" />
                    {{ session.time }}
                  </div>
                </td>
                <td class="p-6 text-slate-600 hidden md:table-cell">
                  {{ session.details }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer / Download -->
        <div
          class="p-8 bg-slate-50 border-t border-slate-200 text-center flex flex-col items-center"
        >
          <p class="text-slate-500 mb-6 italic text-sm max-w-2xl">
            Times and features may vary. Closing time is dependent on the day’s
            activities. Availability and offerings are subject to change without
            notice. Please contact us for the most current information.
          </p>
          <BaseButton variant="gold" class="gap-2 shadow-lg shadow-gold/20">
            <Download class="w-4 h-4" />
            Download Program
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Clock } from "lucide-vue-next";
import BaseButton from "~/components/ui/BaseButton.vue";
import { BUSINESS_INFO } from "~/utils/business";

useSeoMeta({
  title: "Schedule | Mary Esther Bingo",
  description: `View our general schedule at ${BUSINESS_INFO.name}. Sessions are offered daily.`,
});

const sessions = [
  {
    name: "Doors Open",
    time: "Typically 10:00 AM",
    details: "Doors generally open in the morning for ticket sales.",
  },
  {
    name: "Daytime Sessions",
    time: "Late Morning",
    details:
      "Gameplay generally begins shortly after doors open. Jackpot-style games may be featured.",
  },
  {
    name: "Afternoon Play",
    time: "Afternoon",
    details:
      "Progressive or special daytime games are commonly offered later in the afternoon.",
  },
  {
    name: "Evening Session",
    time: "Early Evening",
    details:
      "Evening session sales usually begin in the late afternoon. Sessions often conclude later in the night.",
  },
  {
    name: "Late Night",
    time: "Following Evening",
    details:
      "Additional fast-paced or shorter-format games may be offered following evening sessions.",
  },
];
</script>
