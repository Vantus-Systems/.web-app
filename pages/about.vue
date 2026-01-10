<template>
  <div>
    <!-- Hero/Intro -->
    <section class="bg-primary-900 text-white py-20 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2940&auto=format&fit=crop')] opacity-10 bg-cover bg-center"
      ></div>
      <div class="container mx-auto px-4 relative z-10 text-center">
        <h1 class="text-4xl md:text-6xl font-heading font-bold mb-6">
          Our Community Mission
        </h1>
        <p
          class="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto font-light leading-relaxed"
        >
          {{ BUSINESS_INFO.name }} is a volunteer-supported organization
          dedicated to assisting local community partners.
        </p>
      </div>
    </section>

    <section class="py-24 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl text-primary-900 mb-4">
            Supporting Our Community
          </h2>
          <p class="text-slate-600 max-w-2xl mx-auto text-lg">
            We are community-focused. Participation supports local organizations
            and initiatives in our area.
          </p>
        </div>

        <div v-if="pending" class="text-center py-20">
          <div
            class="animate-spin h-8 w-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto"
          ></div>
        </div>

        <div v-else>
          <!-- Charity Logos Grid (Visual representation) -->
          <div
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center mb-20 opacity-80"
          >
            <div
              v-for="(charity, index) in charities"
              :key="index"
              class="w-full flex justify-center grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-105"
            >
              <div
                class="bg-slate-50 p-6 rounded-xl border border-slate-100 w-full h-32 flex items-center justify-center text-center shadow-sm relative overflow-hidden"
              >
                <img
                  v-if="charity.logo"
                  :src="charity.logo"
                  :alt="charity.name"
                  class="max-w-full max-h-full object-contain p-2"
                />
                <span
                  v-else
                  class="font-bold text-primary-800 leading-tight text-sm md:text-base"
                  >{{ charity.name }}</span
                >
              </div>
            </div>
          </div>

          <!-- Detailed Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BaseCard
              v-for="(charity, index) in charities"
              :key="index"
              class="text-center hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-gold"
            >
              <div
                class="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-700 overflow-hidden"
              >
                <img
                  v-if="charity.logo"
                  :src="charity.logo"
                  :alt="charity.name"
                  class="w-full h-full object-cover"
                />
                <HeartHandshake v-else class="w-10 h-10" />
              </div>
              <h3 class="text-xl font-bold text-primary-900 mb-3">
                {{ charity.name }}
              </h3>
              <p class="text-slate-600 leading-relaxed text-sm">
                {{ charity.description }}
              </p>
              <div
                v-if="charity.impact"
                class="mt-4 pt-4 border-t border-slate-100 text-xs text-emerald-600 font-bold uppercase tracking-wider"
              >
                {{ charity.impact }}
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </section>

    <!-- Volunteer Section -->
    <section class="py-20 bg-slate-50 border-t border-slate-200">
      <div
        class="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12"
      >
        <div class="md:w-1/2">
          <NuxtImg
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop"
            alt="Volunteers working together"
            class="rounded-3xl shadow-xl w-full"
          />
        </div>
        <div class="md:w-1/2">
          <h2 class="text-3xl font-bold text-primary-900 mb-6">
            Powered by Volunteers
          </h2>
          <p class="text-slate-600 text-lg mb-8 leading-relaxed">
            Our friendly team is comprised largely of volunteers who are
            passionate about their community. Their dedication allows us to
            effectively support our partner organizations.
          </p>
          <div class="bg-white p-6 rounded-xl border-l-4 border-gold shadow-sm">
            <p class="text-primary-800 font-medium italic">
              "Community involvement helps build a safer, healthier, and more
              vibrant Mary Esther."
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { HeartHandshake } from "lucide-vue-next";
import BaseCard from "~/components/ui/BaseCard.vue";
import { useBusiness } from "~/composables/useBusiness";

const { business: BUSINESS_INFO, fetchBusiness } = useBusiness();
await fetchBusiness();

const { data: charities, pending } = await useFetch("/api/charities");

useSeoMeta({
  title: "About Us | Mary Esther Bingo",
  description: `Learn about ${BUSINESS_INFO.value.name}, our mission, and the local community organizations we support.`,
});
</script>
