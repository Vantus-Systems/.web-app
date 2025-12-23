<template>
  <footer class="bg-primary-950 text-white pt-16 pb-8">
    <div class="container mx-auto px-4 md:px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-gold font-bold text-xl border-2 border-gold"
            >
              M
            </div>
            <span class="text-xl font-heading font-bold text-white">
              {{ BUSINESS_INFO.name }}
            </span>
          </div>
          <p class="text-primary-100 text-sm leading-relaxed">
            Experience the thrill of the game at Florida's premier bingo
            destination. High stakes, community focus, and endless fun.
          </p>
        </div>

        <div>
          <h3 class="text-gold font-bold mb-4 uppercase tracking-wider text-sm">
            Quick Links
          </h3>
          <ul class="space-y-2">
            <li v-for="link in links" :key="link.name">
              <NuxtLink
                :to="link.path"
                class="text-primary-100 hover:text-white transition-colors text-sm focus:outline-none focus:underline"
              >
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-gold font-bold mb-4 uppercase tracking-wider text-sm">
            Contact Us
          </h3>
          <ul class="space-y-3 text-primary-100 text-sm">
            <li class="flex items-start space-x-3">
              <MapPin class="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
              <span
                >{{ BUSINESS_INFO.address.street }},<br />{{
                  BUSINESS_INFO.address.city
                }}, {{ BUSINESS_INFO.address.state }}
                {{ BUSINESS_INFO.address.zip }}</span
              >
            </li>
            <li class="flex items-center space-x-3">
              <Phone class="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
              <a
                :href="`tel:${BUSINESS_INFO.contact.phonePlain}`"
                class="hover:text-white"
                >{{ BUSINESS_INFO.contact.phone }}</a
              >
            </li>
            <li class="flex items-center space-x-3">
              <Clock class="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
              <span>{{ BUSINESS_INFO.hours }}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-gold font-bold mb-4 uppercase tracking-wider text-sm">
            Legal & Trust
          </h3>
          <p class="text-primary-100 text-sm mb-4">
            Must be 18+ to play. Please play responsibly.
          </p>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                to="/house-rules"
                class="text-primary-100 hover:text-white transition-colors text-sm underline decoration-gold/50 hover:decoration-gold"
              >
                House Rules
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/privacy"
                class="text-primary-100 hover:text-white transition-colors text-sm underline decoration-gold/50 hover:decoration-gold"
              >
                Privacy Policy
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="border-t border-primary-900 pt-8 text-center text-primary-300 text-sm flex flex-col md:flex-row justify-between items-center"
      >
        <p>
          &copy; {{ new Date().getFullYear() }} {{ BUSINESS_INFO.name }}. All
          rights reserved.
        </p>
        <p class="mt-2 md:mt-0 text-xs">Volunteer-run • 100% Charity Support</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { MapPin, Phone, Clock } from "lucide-vue-next";
import { BUSINESS_INFO } from "~/utils/business";

const links = [
  { name: "Home", path: "/" },
  { name: "Schedule", path: "/schedule" },
  { name: "Pricing", path: "/pricing" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];
</script>
