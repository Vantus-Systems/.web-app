<template>
  <footer class="bg-primary-950 text-white pt-16 pb-8">
    <div class="container mx-auto px-4 md:px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
             <div class="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-gold font-bold text-xl border-2 border-gold">
              M
            </div>
            <span class="text-xl font-heading font-bold text-white">
              Mary Esther Bingo
            </span>
          </div>
          <p class="text-primary-100 text-sm leading-relaxed">
            Experience the thrill of the game at Florida's premier bingo destination. High stakes, community focus, and endless fun.
          </p>
        </div>

        <div>
          <h3 class="text-gold font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
          <ul class="space-y-2">
            <li v-for="link in ['Home', 'Schedule', 'Pricing', 'About', 'Contact']" :key="link">
              <NuxtLink :to="link === 'Home' ? '/' : `/${link.toLowerCase()}`" class="text-primary-100 hover:text-white transition-colors text-sm">
                {{ link }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-gold font-bold mb-4 uppercase tracking-wider text-sm">Contact Us</h3>
          <ul class="space-y-3 text-primary-100 text-sm">
            <li class="flex items-start space-x-3">
              <MapPin class="w-5 h-5 text-gold shrink-0" />
              <span>481 Mary Esther Blvd,<br>Mary Esther, FL 32569</span>
            </li>
            <li class="flex items-center space-x-3">
              <Phone class="w-5 h-5 text-gold shrink-0" />
              <span>(850) 226-4359</span>
            </li>
            <li class="flex items-center space-x-3">
              <Clock class="w-5 h-5 text-gold shrink-0" />
              <span>Daily 10:00 AM – 12:30 AM</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-gold font-bold mb-4 uppercase tracking-wider text-sm">Legal</h3>
           <p class="text-primary-100 text-sm mb-4">
            Must be 18+ to play. Please play responsibly.
          </p>
          <ul class="space-y-2">
            <li>
               <NuxtLink to="/house-rules" class="text-primary-100 hover:text-white transition-colors text-sm underline decoration-gold/50 hover:decoration-gold">
                House Rules & Policies
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-primary-900 pt-8 text-center text-primary-300 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} Mary Esther Bingo. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { MapPin, Phone, Clock } from 'lucide-vue-next';
</script>
