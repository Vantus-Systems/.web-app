<template>
  <div class="bg-slate-50 min-h-screen py-20">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl text-primary-900 mb-4">Daily Schedule</h1>
        <p class="text-slate-600 max-w-2xl mx-auto text-lg">
          Join us for Morning, Matinee, and Evening sessions. Doors open early!
        </p>
      </div>

      <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div class="bg-gold-400/10 p-6 text-center border-b border-gold/20">
          <h2 class="text-2xl font-bold text-primary-900">Doors Open Daily at 10:00 AM</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-primary-900 text-white">
                <th class="p-6 font-heading font-bold text-lg">Session</th>
                <th class="p-6 font-heading font-bold text-lg">Approximate Start Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="session in sessions" :key="session.name" class="hover:bg-primary-50 transition-colors">
                <td class="p-6 font-bold text-primary-900 text-xl">{{ session.name }}</td>
                <td class="p-6 text-slate-600 text-lg font-medium">{{ session.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-8 bg-primary-50 border-t border-primary-100 text-center">
            <p class="text-slate-600 mb-6 italic">Schedule is subject to change during holidays and special events.</p>
            <BaseButton variant="outline" class="gap-2">
                <Download class="w-4 h-4" />
                Download Monthly Program
            </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download } from 'lucide-vue-next';
import BaseButton from '~/components/ui/BaseButton.vue';

useSeoMeta({
  title: 'Schedule | Mary Esther Bingo',
  description: 'Check our daily bingo schedule. Morning, matinee, and evening sessions available every day.',
});

const sessions = [
  {
    name: 'Matinee Session',
    time: '11:30 AM - 12:00 PM'
  },
  {
    name: 'Evening Session',
    time: '6:00 PM'
  },
  {
    name: 'Late Night',
    time: 'Until approx 12:30 AM - 1:00 AM'
  }
];
</script>
