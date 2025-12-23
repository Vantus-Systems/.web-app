<template>
  <div class="bg-slate-50 min-h-screen py-20">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl text-primary-900 mb-4">
          Pricing & Packs
        </h1>
        <p class="text-slate-600 max-w-2xl mx-auto text-lg">
          Choose your way to play. We offer both paper and electronic bingo
          machines.
        </p>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20"
      >
        <BaseCard
          v-for="(pack, index) in packs"
          :key="index"
          class="relative hover:-translate-y-2 transition-transform duration-300 flex flex-col"
        >
          <div
            v-if="pack.popular"
            class="absolute top-0 right-0 bg-gold text-primary-900 text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-bl-xl"
          >
            Most Popular
          </div>

          <div class="mb-6">
            <h3 class="text-2xl font-bold text-primary-900 mb-2">
              {{ pack.name }}
            </h3>
            <p class="text-slate-500 text-sm">{{ pack.description }}</p>
          </div>

          <div class="mb-8">
            <span class="text-4xl font-bold text-primary-700"
              >${{ pack.price }}</span
            >
            <span class="text-slate-400">/ session</span>
          </div>

          <ul class="space-y-4 mb-8 flex-grow">
            <li
              v-for="feature in pack.features"
              :key="feature"
              class="flex items-start gap-3 text-slate-600"
            >
              <Check class="w-5 h-5 text-primary-500 shrink-0" />
              <span class="text-sm">{{ feature }}</span>
            </li>
          </ul>

          <BaseButton
            :variant="pack.popular ? 'primary' : 'outline'"
            class="w-full"
          >
            View Details
          </BaseButton>
        </BaseCard>
      </div>

      <!-- Electronics vs Paper -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-slate-100"
      >
        <div>
          <h2 class="text-3xl font-bold text-primary-900 mb-6">
            Paper vs. Tech-Assist
          </h2>
          <div class="space-y-6">
            <div>
              <h3
                class="text-xl font-bold text-primary-700 mb-2 flex items-center gap-2"
              >
                <ScrollText class="w-5 h-5" /> Traditional Paper
              </h3>
              <p class="text-slate-600">
                Perfect for purists who love the dauber action. Manage your own
                cards and feel the excitement as you mark off the winning
                numbers.
              </p>
            </div>
            <div>
              <h3
                class="text-xl font-bold text-primary-700 mb-2 flex items-center gap-2"
              >
                <Tablet class="w-5 h-5" /> Tech-Assist Terminals
              </h3>
              <p class="text-slate-600">
                Play more cards with ease! Our luxury "Traveler" handheld units
                automatically daub your numbers, so you never miss a win.
              </p>
            </div>
          </div>
        </div>
        <div class="h-80 bg-slate-200 rounded-2xl overflow-hidden relative">
          <NuxtImg
            src="https://images.unsplash.com/photo-1595039838779-f3780873afdd?q=80&w=2940&auto=format&fit=crop"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent flex items-end p-6"
          >
            <p class="text-white font-bold text-lg">
              Electronic Play Experience
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, ScrollText, Tablet } from "lucide-vue-next";
import BaseCard from "~/components/ui/BaseCard.vue";
import BaseButton from "~/components/ui/BaseButton.vue";

useSeoMeta({
  title: "Pricing | Mary Esther Bingo",
  description:
    "Affordable bingo packs for everyone. Check out our starter packs, high-roller options, and electronic bingo machine pricing.",
});

const packs = [
  {
    name: "Starter Paper Pack",
    price: 25,
    description: "Great for traditional play",
    popular: false,
    features: [
      "Standard Paper Cards",
      "Access to Regular Games",
      "Perfect for Beginners",
    ],
  },
  {
    name: "Electronic Bundle",
    price: 50,
    description: "Enhanced play experience",
    popular: true,
    features: [
      "Tech-Assist Terminal Rental",
      "Multiple Card Faces",
      "Automated Daubing",
      "Increased Winning Chances",
    ],
  },
  {
    name: "High Roller VIP",
    price: 100,
    description: "Maximize your winning potential",
    popular: false,
    features: [
      "Maximum Electronic Cards",
      "Premium Paper Pack Included",
      "All Progressive Games",
      "Best Value Per Card",
    ],
  },
];
</script>
