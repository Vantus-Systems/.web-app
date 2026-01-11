<script setup lang="ts">
import { HeartHandshake, Star, Users, ShieldCheck } from "lucide-vue-next";
import BaseCard from "~/components/ui/BaseCard.vue";
import { useBusiness } from "~/composables/useBusiness";

const { business: BUSINESS_INFO, fetchBusiness } = useBusiness();
await fetchBusiness();

const { data: charities, pending } = await useFetch("/api/charities");

useSeoMeta({
  title: "Community Intelligence | Mary Esther Bingo",
  description: `Operational data for ${BUSINESS_INFO.value.name}. Community mission and partner lists.`,
});
</script>

<template>
  <div class="bg-black text-white min-h-screen">
    <!-- Hero/Intro -->
    <section class="relative py-32 overflow-hidden border-b border-zinc-900">
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2940&auto=format&fit=crop"
          class="w-full h-full object-cover opacity-15 scale-105"
        />
      </div>
      
      <div class="container mx-auto px-4 relative z-10 text-center">
        <div 
          v-motion-fade-visible-once
          class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-8 shadow-[0_0_20px_rgba(78,221,97,0.3)]"
        >
          <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Mission Active</span>
        </div>
        
        <h1 
          v-motion-fade-visible-once
          class="text-6xl md:text-[8rem] lg:text-[10rem] font-black uppercase tracking-tighter mb-8 leading-[0.85] text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          <span class="block">Community</span>
          <span class="block text-primary drop-shadow-[0_0_60px_rgba(78,221,97,0.8)]">Legacy</span>
        </h1>
        <p
          v-motion-fade-visible-once
          class="text-xl md:text-3xl text-gray-200 max-w-4xl mx-auto font-black uppercase tracking-widest leading-relaxed bg-black/60 backdrop-blur-md py-4 rounded-2xl border border-white/5"
        >
          High-stakes gaming meets <span class="text-primary">serious community giving.</span> Every jackpot won helps our amazing local partners.
        </p>
      </div>
    </section>

    <!-- Support Section -->
    <section class="py-32 relative bg-black border-t border-primary/10">
      <!-- Kinetic BG -->
      <div class="absolute inset-0 z-0">
         <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(78,221,97,0.08),transparent_70%)]"></div>
      </div>
      
      <div class="container mx-auto px-4 relative z-10">
        <div class="text-center mb-24">
            <div class="inline-flex items-center gap-3 mb-6">
              <div class="w-16 h-0.5 bg-primary"></div>
              <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Strategic Partners</span>
              <div class="w-16 h-0.5 bg-primary"></div>
            </div>
            <h2 class="text-5xl md:text-[7rem] font-black text-white mb-6 uppercase tracking-tighter leading-[0.9] drop-shadow-[0_0_35px_rgba(78,221,97,0.4)]">
              Charity <span class="text-primary block">Partners</span>
            </h2>
            <p class="text-zinc-400 max-w-2xl mx-auto text-xl font-black uppercase tracking-widest leading-relaxed">
              Play big, win big, give back. A portion of every buy-in directly supports these amazing local causes.
            </p>
        </div>

        <div v-if="pending" class="text-center py-20">
          <div
            class="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"
          ></div>
        </div>

        <div v-else>
          <!-- Charity Logos Grid -->
          <div
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center mb-32"
          >
            <div
              v-for="(charity, index) in charities"
              :key="index"
              class="w-full group"
            >
              <div
                class="bg-charcoal p-8 rounded-3xl border-2 border-zinc-800 w-full h-40 flex items-center justify-center text-center shadow-2xl relative overflow-hidden group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(78,221,97,0.3)] transition-all duration-500"
              >
                <div class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.08] transition-opacity"></div>
                <img
                  v-if="charity.logo"
                  :src="charity.logo"
                  :alt="charity.name"
                  class="max-w-full max-h-full object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <span
                  v-else
                  class="font-black text-zinc-500 uppercase tracking-tighter group-hover:text-primary transition-colors"
                  >{{ charity.name }}</span
                >
              </div>
            </div>
          </div>

          <!-- Detailed Manifests -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div
              v-for="(charity, index) in charities"
              :key="index"
              class="group bg-charcoal p-10 rounded-[2.5rem] border-2 border-zinc-800 hover:border-primary transition-all duration-500 hover:scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_60px_rgba(78,221,97,0.25)] relative overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div
                class="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-8 relative z-10 overflow-hidden border-2 border-zinc-800 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(78,221,97,0.4)] transition-all duration-500"
              >
                <img
                  v-if="charity.logo"
                  :src="charity.logo"
                  :alt="charity.name"
                  class="w-full h-full object-cover p-2"
                />
                <HeartHandshake v-else class="w-10 h-10 text-primary" />
              </div>
              
              <h3 class="text-3xl font-black text-white mb-4 uppercase tracking-tighter group-hover:text-primary transition-colors">
                {{ charity.name }}
              </h3>
              <p class="text-zinc-400 font-bold text-sm leading-relaxed mb-8">
                {{ charity.description }}
              </p>
              
              <div
                v-if="charity.impact"
                class="pt-6 border-t border-zinc-800 text-[10px] font-black text-primary uppercase tracking-[0.3em]"
              >
                 <div class="flex items-center gap-2">
                    <Star class="w-3 h-3" />
                    {{ charity.impact }}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Volunteer Section -->
    <section class="py-32 bg-black border-t border-zinc-900">
      <div
        class="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-20"
      >
        <div class="lg:w-1/2 relative group">
          <div class="absolute -inset-4 bg-primary/30 rounded-[3rem] blur-2xl group-hover:bg-primary/40 transition-all"></div>
          <img
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2000&auto=format&fit=crop"
            alt="Volunteers"
            class="rounded-[2.5rem] shadow-2xl w-full relative z-10 border-2 border-zinc-800 group-hover:border-primary transition-all duration-500"
          />
        </div>
        <div class="lg:w-1/2">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-8 shadow-[0_0_15px_rgba(78,221,97,0.3)]">
             <Users class="w-4 h-4 text-primary" />
             <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Field Operators</span>
          </div>
          
          <h2 class="text-5xl md:text-[6rem] font-black text-white mb-8 uppercase tracking-tighter leading-[0.9] drop-shadow-[0_0_20px_rgba(78,221,97,0.3)]">
            Community <span class="text-primary block">Heroes</span>
          </h2>
          <p class="text-zinc-400 text-xl font-black uppercase tracking-widest mb-10 leading-relaxed">
            The friendly faces that make the magic happen. Our dedicated volunteers run the show so you can enjoy the thrill.
          </p>
          
          <div class="bg-charcoal p-10 rounded-[2.5rem] border-2 border-zinc-800 shadow-2xl group relative overflow-hidden hover:border-primary transition-all duration-500">
            <div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-white text-2xl font-black italic tracking-tight relative z-10 leading-relaxed">
              "Community involvement is the engine that drives a safer, healthier, and more vibrant Mary Esther."
            </p>
            <div class="mt-6 flex items-center gap-2 relative z-10">
                <ShieldCheck class="w-5 h-5 text-primary" />
                <span class="text-[10px] font-black uppercase tracking-widest text-primary">Mission Statement</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
