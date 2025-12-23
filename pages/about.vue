<template>
  <div>
    <!-- Hero -->
    <section class="bg-primary-900 text-white py-24 relative overflow-hidden">
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gold rounded-full opacity-10 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary-500 rounded-full opacity-20 blur-3xl"></div>

      <div class="container mx-auto px-4 relative z-10 text-center">
        <h1 class="text-4xl md:text-6xl font-heading font-bold mb-6">About Mary Esther Bingo</h1>
        <p class="text-xl text-primary-100 max-w-3xl mx-auto font-light">
          More than just a bingo hall. We are a community hub dedicated to entertainment and giving back.
        </p>
      </div>
    </section>

    <!-- Mission & Story -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row gap-16 items-center">
          <div class="md:w-1/2">
             <div class="relative">
                <div class="absolute -inset-4 bg-gold/20 rounded-2xl transform rotate-3"></div>
                <NuxtImg src="https://images.unsplash.com/photo-1526614180703-827d23e761f4?q=80&w=2835&auto=format&fit=crop" class="relative rounded-2xl shadow-xl w-full" />
             </div>
          </div>
          <div class="md:w-1/2 space-y-6">
            <h2 class="text-3xl font-bold text-primary-900">A Tradition of Fun & Philanthropy</h2>
            <p class="text-slate-600 leading-relaxed text-lg">
              Mary Esther Bingo has been a staple of the Mary Esther community for years. We strive to provide a safe, comfortable, and exciting environment for players of all levels.
            </p>
            <p class="text-slate-600 leading-relaxed text-lg">
              Our facility features state-of-the-art electronic bingo machines, spacious seating, and a full-service snack bar. But what truly sets us apart is our commitment to our community.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Charity Support -->
    <section class="py-20 bg-slate-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl text-primary-900 mb-4">Supporting Our Community</h2>
          <p class="text-slate-600 max-w-2xl mx-auto text-lg">
            A portion of our proceeds goes directly to supporting vital local organizations.
          </p>
        </div>

        <!-- Charity Logos Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center mb-16 opacity-80">
           <!-- Placeholders for Logos - Using text for now but styled as logos -->
           <div v-for="(charity, index) in charities" :key="index" class="w-full flex justify-center grayscale hover:grayscale-0 transition-all duration-300">
              <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 w-full h-32 flex items-center justify-center text-center">
                 <span class="font-bold text-primary-800 leading-tight">{{ charity.name }}</span>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BaseCard v-for="(charity, index) in charities" :key="index" class="text-center hover:shadow-xl transition-shadow duration-300">
            <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-700">
              <HeartHandshake class="w-10 h-10" />
            </div>
            <h3 class="text-xl font-bold text-primary-900 mb-3">{{ charity.name }}</h3>
            <p class="text-slate-600">{{ charity.description }}</p>
          </BaseCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { HeartHandshake } from 'lucide-vue-next';
import BaseCard from '~/components/ui/BaseCard.vue';

useSeoMeta({
  title: 'About Us | Mary Esther Bingo',
  description: 'Learn about Mary Esther Bingo, our mission, and the local charities we support like Brain Injury Connection and Fire Rescue.',
});

const charities = [
  {
    name: 'Brain Injury Connection',
    description: 'Supporting individuals and families affected by brain injuries through education, advocacy, and community resources.'
  },
  {
    name: 'Mary Esther Fire Rescue',
    description: 'Helping our local heroes provide emergency services, fire prevention, and safety education to our community.'
  },
  {
    name: 'Emerald Coast Foundation',
    description: 'Dedicated to supporting children and youth in Northwest Florida through various charitable initiatives.'
  },
  {
    name: 'Okaloosa Walton Homeless Continuum',
    description: 'Working to end homelessness in our region through coordinated community efforts and support services.'
  },
  {
    name: 'Eleanor J. Johnson Youth Center',
    description: 'Providing a safe and nurturing environment for after-school and summer programs for local youth.'
  }
];
</script>
